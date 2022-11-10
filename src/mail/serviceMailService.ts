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
): Promise<string[]> {
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
  const dbDistributors = await Promise.all(
    targetDistributorEmails.map(async targetDistributorEmail =>
      Distributor.findOne({ mailPrefix: targetDistributorEmail })
    )
  );

  try {
    await user.save();
  } catch (e) {
    return null;
  }

  const confirmationLink: string[] = [];

  dbDistributors.forEach(dist => {
    const confirmLink = `${
      process.env.HOST
    }/confirm?user=${user._id.toString()}&distributor=${dist._id.toString()}`;
    confirmationLink.push(confirmLink);
    sender.sendMail(
      email,
      `Confirm your Subscription to ${dist.mailPrefix}`,
      `Klicke <a href='${confirmLink}'>hier</a> um die Änderung am Newsletter zu bestätigen.`
    );
  });

  return confirmationLink;
}
