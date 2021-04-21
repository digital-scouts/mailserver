import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import apiSpec from '../openapi.json';
import * as receiver from './mail/receiver';
import { fakeEmail } from './mail/receiver';
import logger from './logger';

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }'
};

const router = Router();

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

router.get('/fake', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/fakesender.html`));
});
router.get('/subscribe', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/subscribe.html`));
});

// Dev routes
if (process.env.NODE_ENV === 'development') {
  router.use('/dev/api-docs', swaggerUi.serve);
  router.get('/dev/api-docs', swaggerUi.setup(apiSpec, swaggerUiOptions));
}

export default router;
