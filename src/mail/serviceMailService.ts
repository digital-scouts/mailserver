import Subscription from '../models/subscription';
import * as sender from './sender';
import logger from '../logger';

export function handleNewServiceMail(from: string, to: string, subject: string, text: string) {
  logger.debug('handleNewServiceMail');
}

/**
 *
 * @param from    - sender
 * @param subject - subject of mail
 * @param text    - content of mail
 */
export async function handleNewSubscription(from: string, subject: string, text: string) {
  const subscription = new Subscription({
    email: from,
    distributor: text
  });
  const s = await subscription.save();
  sender.sendMail(from, 'Confirm your Subscription', s._id.toString());
}
