import User from '../models/user';
import * as sender from './sender';
import logger from '../logger';
import Distributor, { IDistributor } from '../models/distriburor';

export function handleNewServiceMail(
  from: string,
  to: string,
  subject: string,
  text: string
) {
  logger.debug('handleNewServiceMail');
}

/**
 *
 * @param email
 * @param name
 * @param targetDistributorEmails
 */
export async function handleNewSubscription(
  email: string,
  name: string,
  nameKind: string,
  targetDistributorEmails: string[]
): Promise<boolean> {
  let user = await User.findOne({ email }).exec();
  if (!user) {
    logger.info('new User');
    user = new User({
      email,
      name,
      subscribedDistributors: []
    });
  }
  logger.debug(
    JSON.stringify({
      user,
      email,
      name
    })
  );
  logger.debug(JSON.stringify({ targetDistributorEmails }));

  // update subscribedDistributors | override but keep confirmation
  user.subscribedDistributors = await Promise.all(
    targetDistributorEmails.map(async (targetDistributorEmail: string) => {
      const dbDistributor = await Distributor.findOne({
        mailPrefix: targetDistributorEmail
      });
      const userDistributor = user.subscribedDistributors.find(
        (d: { _id?: string; distributor: IDistributor; confirmed: boolean }) =>
          d.distributor.mailPrefix === dbDistributor.mailPrefix
      );
      return {
        distributor: dbDistributor,
        confirmed: userDistributor?.confirmed || false
      };
    })
  );

  logger.info(JSON.stringify(user.subscribedDistributors));
  try {
    await user.save();
  } catch (e) {
    return false;
  }

  user.subscribedDistributors.forEach(
    (s: { _id?: string; distributor: IDistributor; confirmed: boolean }) => {
      if (!s.confirmed) {
        const confirmLink = `${
          process.env.HOST
        }/confirm?id=${s._id.toString()}`;
        sender.sendMail(
          email,
          `Confirm your Subscription to ${s.distributor.mailPrefix}`,
          `Klicke <a href='${confirmLink}'>hier</a> um die Änderung am Newsletter zu bestätigen.`
        );
      }
    }
  );

  return true;
}
