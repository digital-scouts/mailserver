import { inspect } from 'util';
import logger from '../logger';
import User, { IUser } from '../models/user';
import * as MailSender from './sender';
import Distributor, { IDistributor } from '../models/distriburor';
import { IMail } from '../models/mail';

const { CronJob } = require('cron');

async function getAdmins(
  distributor: IDistributor
): Promise<Array<{ name: string; address: string }>> {
  if (distributor === undefined || distributor === null) {
    logger.warn('Send mail failed. distributorModel not found');
    return [];
  }

  const users: Array<{ name: string; address: string }> = [];

  for (const id of distributor.admins) {
    // eslint-disable-next-line no-await-in-loop
    const user = await User.findById(id).exec();

    users.push({
      name: user.name,
      address: user.email
    });
  }

  return users;
}

async function getRecipients(
  distributor: IDistributor
): Promise<Array<{ name: string; address: string }>> {
  if (distributor === undefined || distributor === null) {
    logger.warn('Send mail failed. distributorModel not found');
    return [];
  }

  const userModels: Array<IUser> = await User.find({
    'subscribedDistributors.distributor': distributor._id
  }).exec();

  const userData: Array<{ name: string; address: string }> = userModels.map(
    (u: IUser) => ({
      name: u.name,
      address: u.email
    })
  );

  // add admins and remove duplicate objects
  const returnArray = userData.concat(await getAdmins(distributor));
  return [...new Set(returnArray.map((o: any) => JSON.stringify(o)))].map(
    (s: string) => JSON.parse(s)
  );
}

/**
 * Determine if the mail is a answer to a previous email
 */
function isAnswer(mail: IMail): boolean {
  logger.debug(`isAnswer: ${mail.subject.toLowerCase().includes('re:')}`);
  return mail.subject.toLowerCase().includes('re:');
}

/**
 * Determine if distributor is restricted to send
 */
function isPublic(distributor: IDistributor): boolean {
  logger.debug(`isPublic: ${!distributor.sendRestricted}`);
  return !distributor.sendRestricted;
}

/**
 * check if sender is allowed to send mail to distributor
 */
async function isAllowed(
  sender: string,
  distributor: IDistributor
): Promise<boolean> {
  const user: IUser = await User.findOne({ email: sender }).exec();

  if (!user) {
    logger.warn('Send mail failed. Sender not found');
    return false;
  }

  const allowed = user.allowedDistributors.find(
    (d: IDistributor) => d._id.toString() === distributor.id
  );
  logger.debug(`isAllowed: ${allowed !== undefined}`);
  return allowed !== undefined;
}

async function sendToAllMembers(mail: IMail, distibutor: IDistributor) {
  const recipients = await getRecipients(distibutor);
  // MailSender.sendDistributorEmail(mail.from, recipients, mail.subject, mail.body, mail.to);
  logger.debug(`Send mail to all members: ${inspect(recipients)}`);
}

async function sendToAdmins(mail: IMail, distibutor: IDistributor) {
  const admins = await getAdmins(distibutor);
  logger.debug(`Send mail to admins: ${inspect(admins)}`);
  // MailSender.sendDistributorEmail(mail.from, admins, mail.subject, mail.body, mail.to);
}

async function sendMailAsAnswer(mail: IMail) {
  logger.info('Send mail as answer');
  // todo get previous mail
  // todo get admins
  // todo get previous mail sender
  // todo send
}

async function distributeMail(mail: IMail) {
  if (isAnswer(mail)) {
    sendMailAsAnswer(mail);
    return;
  }

  if (
    isPublic(mail.distributor) ||
    (await isAllowed(mail.from, mail.distributor))
  ) {
    sendToAllMembers(mail, mail.distributor);
    return;
  }

  sendToAdmins(mail, mail.distributor);
}

export function startDistributorService(): void {
  logger.info('startDistributorService');

  const job = new CronJob(
    '*/10 * * * *',
    () => {
      // start distibutor 5 second after cron job to give imap reciever time to start
      setTimeout(() => {}, 5000);
    },
    null,
    true,
    'Europe/Berlin'
  );
}
