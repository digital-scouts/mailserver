import Subscription from '../models/subscription';
import * as sender from './sender';
import logger from '../logger';
import BadRequest from '../errors/bad-request';

export function handleNewServiceMail(from: string, to: string, subject: string, text: string) {
  logger.debug('handleNewServiceMail');
}

/**
 *
 * @param email
 * @param name
 * @param distributors
 */
export async function handleNewSubscription(email: string, name: string, distributors: string[])
  : Promise<boolean> {
  let s;
  try {
    s = await new Subscription({
      email,
      name,
      distributors
    }).save();
  } catch (e) {
    return false;
    // todo handle save error
  }
  sender.sendMail(email, 'Confirm your Subscription', `Klicke auf den Link oder kopiere ihn in deinen Browser um änderung am Newsletter zu bestätigen ${process.env.HOST}/confirm?id=${s._id.toString()}`);
  return true;
}
