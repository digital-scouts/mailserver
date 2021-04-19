import logger from '../logger';

const sender = require('./sender');
const subscription = require('./subscriptionService');
const distributor = require('./distributorService');

export function receive(from: string, to: string, subject: string, text: string) {
  logger.debug(to);
  if (to.split('@')[0] === 'subscribe') {
    logger.debug('subscription request received')
    subscription.handleNewSubscription(from, subject, text);
  } else if (to.split('@')[0].includes('-verteiler')) {
    logger.debug('distribution request received')
    distributor.handleNewDistribution(from, to, subject, text);
  }

  // sender.sendMail(from, `RE: ${subject}`, text);
}
