import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import apiSpec from '../openapi.json';
import * as receiver from './mail/receiver';
import { fakeEmail } from './mail/receiver';
import logger from './logger';
import * as distributorService from './services/distributorService';
import * as subscriptionService from './services/subscriptionService';
import * as serviceMailService from './mail/serviceMailService';

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }'
};

const router = Router();
router.get('/subscribe', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/subscribe.html`));
});
router.get('/distributorlist', async (req, res) => {
  res.json(await distributorService.getAllDistributors())
    .status(200);
});
router.post('/subscribe', async (req, res) => {
  if (!req.body || !req.body.name || !req.body.email || !req.body.distributor) {
    res.sendStatus(400);
    return;
  }
  if (!await serviceMailService
    .handleNewSubscription(req.body.email, req.body.name, req.body.distributor)) {
    res.status(400)
      .send('Die E-Mail-Adresse ist bereits im Verteiler. Änderungen können über einen Link am Ende der E-Mails aus dem Verteiler vorgenommen werden.');
    return;
  }
  res.sendStatus(200);
});

router.get('/confirm', (req, res) => {
  if (!req.query || !req.query.id) {
    res.sendStatus(400);
    return;
  }
  subscriptionService.confirmDistributor(req.body.id)
    .then(r => {
      logger.info(`Subscriber confirmed ${r.name}`);
      res.sendStatus(200);
    }, error => {
      logger.warn('Subscriber confirmation failed:');
      logger.warn(error);
      res.sendStatus(400);
    });

  // todo return html file
});

// Dev routes
if (process.env.NODE_ENV === 'development') {
  router.use('/dev/api-docs', swaggerUi.serve);
  router.get('/dev/api-docs', swaggerUi.setup(apiSpec, swaggerUiOptions));

  router.get('/fake', (req, res) => {
    res.sendFile(path.join(`${__dirname}/views/fakesender.html`));
  });
  router.post('/sendfake', (req, res) => {
    if (req.query && req.query.text && req.query.subject && req.query.to) {
      logger.debug(`send fake mail ${req.query.text} ${req.query.subject} ${req.query.to}`);
      receiver.receiveMail(
        fakeEmail(req.query.text as string, req.query.subject as string, req.query.to as string)
      );
      res.sendStatus(204);
    } else {
      res.sendStatus(400);
    }
  });
}

export default router;
