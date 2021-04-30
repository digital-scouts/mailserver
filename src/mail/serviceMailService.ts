import User from '../models/user';
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
export async function handleNewSubscription(email: string, name: string, distributors: string[])
  : Promise<boolean> {
  let user = await User.findOne({ email })
    .exec();
  if (!user) {
    logger.info('new User');
    user = new User({
      email,
      name,
      subscribedDistributors: []
    });
  }

  // update subscribedDistributors | override but keep confirmation
  user.subscribedDistributors = distributors.map((distributor: string) => {
    const subscribedDistributor = user.subscribedDistributors.find(u => u.email === distributor);
    return {
      email: distributor,
      confirmed: subscribedDistributor ? subscribedDistributor.confirmed : false
    };
  });

  logger.info(JSON.stringify(user.subscribedDistributors));
  try {
    await user.save();
  } catch (e) {
    return false;
  }

  user.subscribedDistributors.forEach(s => {
    if (!s.confirmed) {
      const confirmLink = `${process.env.HOST}/confirm?id=${s._id.toString()}`;
      sender.sendMail(email, `Confirm your Subscription to ${s.email}`,
        `Klicke <a href='${confirmLink}'>hier</a> um die Änderung am Newsletter zu bestätigen.`);
    }
  });

  return true;
}
