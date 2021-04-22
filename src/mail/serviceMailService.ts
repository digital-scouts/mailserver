import Subscription from '../models/subscription';
import * as sender from './sender';
import logger from '../logger';

export function handleNewServiceMail(from: string, to: string, subject: string, text: string) {
  logger.debug('handleNewServiceMail');
}

/**
 *
 * @param email
 * @param name
 * @param distributors
 */
export async function handleNewSubscription(email: string, name: string, distributors: string[]) {
  const subscription = new Subscription({
    email,
    name,
    distributors
  });

  let s;
  try {
    s = await subscription.save();
  } catch (e) {
    return;
    // todo handle save error
  }
  sender.sendMail(email, 'Confirm your Subscription', `Klicke auf den Link oder kopiere ihn in deinen Browser um änderung am Newsletter zu bestätigen ${process.env.HOST}/confirm?id=${s._id.toString()}`);
}
