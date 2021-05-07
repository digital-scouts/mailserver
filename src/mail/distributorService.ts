import logger from '../logger';
import * as sender from './sender';
import User, { IUser } from '../models/user';
import Distributor, { IDistributor } from '../models/distriburor';

// eslint-disable-next-line max-len
async function getRecipients(distributor: string): Promise<Array<{ name: string, address: string }>> {
  const distributorModel = await Distributor.findOne({ mailPrefix: distributor })
    .exec();

  if (distributor === undefined || distributorModel === null) {
    logger.warn('Send mail failed. distributorModel not found');
    return [];
  }

  const users = await User.find({ 'subscribedDistributors.distributor': distributorModel._id })
    .exec();

  return users.map((u: IUser) => ({
    name: u.name,
    address: u.email
  }));
}

export async function distributeMail(data: any) {
  logger.debug('distributeMail');
  const from = data.from.value[0].address;
  const to = data.to.value[0].address.split('@')[0];
  const {
    subject,
    text
  } = data;

  const recipients = await getRecipients(to);

  sender.sendDistributorEmail(from, recipients, subject, text, to);
}
