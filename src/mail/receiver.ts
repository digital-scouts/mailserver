import logger from '../logger';
import * as bridge from './bridge';

const receiver = require('mailin');

receiver.start({
  port: 25,
  disableWebhook: true, // Disable the webhook posting.
  SMTPBanner: 'Hi from a custom Mailin instance'
});

/* Access simplesmtp server instance. */
receiver.on('authorizeUser', (connection: any, username: string, password: string, done: (arg0: Error, arg1: boolean) => void) => {
  if (username === 'johnsmith' && password === 'mysecret') {
    done(null, true);
  } else {
    done(new Error('Unauthorized!'), false);
  }
});

/* Event emitted after a message was received and parsed. */
receiver.on('message', (connection: any, data: any) => {
  logger.debug('_____________________s_');
  logger.debug(connection);
  logger.debug('----------------------');
  logger.debug(data);
  logger.debug('_____________________e_');

  bridge.receive(data.from, data.to, data.subject, data.text);
});
