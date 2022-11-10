import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import apiSpec from '../openapi.json';
import logger from './logger';
import * as serviceMailService from './mail/serviceMailService';
import Distributor, { IDistributor } from './models/distriburor';
import User, { IUser } from './models/user';

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }'
};

const router = Router();
/**
 * get subscribe view
 */
router.get('/subscribe', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/subscribe/subscribe.html`));
});

/**
 * submit subscription to one or multiple distributors request
 * (need to be confirmed to receive emails from distributor)
 */
router.post('/subscribe', async (req, res) => {
  if (!req.body || !req.body.name || !req.body.email || !req.body.distributor) {
    res.sendStatus(400);
    return;
  }
  logger.info(typeof req.body.distributor);
  if (typeof req.body.distributor === 'string') {
    req.body.distributor = [req.body.distributor];
  }
  const confirmationLink: string[] =
    await serviceMailService.handleNewSubscription(
      req.body.email,
      req.body.name,
      req.body.nameKind,
      req.body.distributor
    );
  if (!confirmationLink) {
    res
      .status(400)
      .send(
        'Die E-Mail-Adresse ist bereits im Verteiler. Änderungen können über einen Link am Ende der E-Mails aus dem Verteiler vorgenommen werden.'
      );
    return;
  }
  logger.debug(confirmationLink);
  res.status(200).send(confirmationLink);
});

/**
 * confirm subscription to be able to receive emails from distributor
 */
router.get('/confirm', async (req, res) => {
  logger.debug(JSON.stringify(req.query));
  if (!req.query || !req.query.user || !req.query.distributor) {
    res.status(400).send('User or distributor missing in query');
    return;
  }
  const user: IUser = await User.findById(req.query.user);
  const distributor: IDistributor = await Distributor.findById(
    req.query.distributor
  );
  if (!user || !distributor) {
    res.status(400).send('Subscriber confirmation failed');
    return;
  }
  user.subscribedDistributors.push({ distributor });
  user.save();
  logger.info(`Subscriber confirmed ${user.name}`);
  res.sendStatus(200);

  // todo send confirmation mail
  // todo return html file
});

/**
 * unsubscribe from distributor
 */
router.get('/unsubscribe', async (req, res) => {
  logger.debug(JSON.stringify(req.query));
  if (!req.query || !req.query.user || !req.query.distributor) {
    res.status(400).send('User or distributor missing in query');
    return;
  }
  const user: IUser = await User.findById(req.query.user);
  if (!user) {
    res.status(400).send('User did not exist');
    return;
  }

  user.subscribedDistributors = user.subscribedDistributors.filter(
    dist =>
      dist.distributor._id.toString() !== (req.query.distributor as string)
  );
  user.save();
  res.sendStatus(200);

  // todo send confirmation mail
});

router.get('/api/users', async (req, res) => {
  res.json(await User.find().exec()).status(200);
});

router.put('/api/user', async (req, res) => {
  if (!req.query || !req.body.email || !req.body.distributor) {
    res.status(400).send('email or distributor not defined in body');
    return;
  }

  const dis = await Distributor.findOne({
    mailPrefix: req.body.distributor as string
  }).exec();
  const user = await User.findOne({ email: req.body.email as string }).exec();

  if (!dis || !user) {
    res.status(400).send('Distributor or User did not exist');
    return;
  }

  user.allowedDistributors.push(dis);
  await user.save();
  res.status(200).send(user);
});

router.get('/api/distributors', async (req, res) => {
  res.json(await Distributor.find().exec()).status(200);
});

router.put('/api/distributor', async (req, res) => {
  if (!req.body || !req.body.id || !req.body.distributor) {
    res.status(400).send('You need to provide an id and a distributor object');
    return;
  }

  const distributor: any = {};

  // eslint-disable-next-line no-prototype-builtins
  if (req.body.distributor.hasOwnProperty('name')) {
    distributor.name = req.body.distributor.name;
  } // eslint-disable-next-line no-prototype-builtins
  if (req.body.distributor.hasOwnProperty('description')) {
    distributor.description = req.body.distributor.description;
  } // eslint-disable-next-line no-prototype-builtins
  if (req.body.distributor.hasOwnProperty('mailPrefix')) {
    distributor.mailPrefix = req.body.distributor.mailPrefix;
  } // eslint-disable-next-line no-prototype-builtins
  if (req.body.distributor.hasOwnProperty('subscribeRestricted')) {
    distributor.subscribeRestricted = req.body.distributor.subscribeRestricted;
  } // eslint-disable-next-line no-prototype-builtins
  if (req.body.distributor.hasOwnProperty('sendRestricted')) {
    distributor.sendRestricted = req.body.distributor.sendRestricted;
  }
  if (!distributor) {
    res.status(400).send('No values to change');
    return;
  }

  res
    .json(await Distributor.findByIdAndUpdate(req.body.id, distributor).exec())
    .status(205);
});

router.delete('/api/distributor', async (req, res) => {
  if (!req.body || !req.body.id) {
    res.status(400);
  }
  res.json(await Distributor.findByIdAndDelete(req.body.id).exec()).status(200);
});

router.post('/api/distributor', async (req, res) => {
  if (!req.body) {
    res.status(400).send('No Body');
    return;
  }
  const {
    name,
    description,
    mailPrefix,
    subscribeRestricted = false,
    sendRestricted = true
  } = req.body;
  if (!name) {
    res.status(400).send('Name not defined');
    return;
  }
  if (!description) {
    res.status(400).send('Description not defined');
    return;
  }
  if (!mailPrefix) {
    res.status(400).send('Mail Prefix not defined');
    return;
  }
  const distributor = new Distributor({
    name,
    description,
    mailPrefix,
    subscribeRestricted,
    sendRestricted
  });

  try {
    res
      .json(await distributor.save())
      .status(201)
      .send();
  } catch (e) {
    res.status(400).send('could not save in DB');
  }
});

// Dev routes
if (process.env.NODE_ENV === 'dev') {
  router.use('/dev/api-docs', swaggerUi.serve);
  router.get('/dev/api-docs', swaggerUi.setup(apiSpec, swaggerUiOptions));
}

export default router;
