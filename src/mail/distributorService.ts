import logger from '../logger';
import * as sender from './sender';
import User, { IUser } from '../models/user';
import Distributor, { IDistributor } from '../models/distriburor';
import { MailInputQueue } from './mailInputQueue';
import { InboundMail } from '../models/inboundMail';
const { CronJob } = require('cron');

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

async function distributeMail(mail: InboundMail) {
  const distributor: IDistributor = await Distributor.findOne({ mailPrefix: mail.to });
  if (!distributor) {
    logger.warn('Send mail failed. distributor not found');
    // todo reply with error
    return;
  }

  if (isAnswer(mail)) {
    sendMailAsAnswer(mail);
    return;
  }

  if (isPublic(distributor) || await isAllowed(mail.from, distributor)) {
    sendToAllMembers(mail);
    return;
  }

  sendToAdmins(mail);
}

async function sendToAllMembers(mail: InboundMail) {
  logger.info('Send mail to all members');
  //const recipients = await getRecipients(mail.to);
  //sender.sendDistributorEmail(mail.from, recipients, mail.subject, mail.body, mail.to);
}

async function sendToAdmins(mail: InboundMail) {
  logger.info('Send mail to admins');
  // todo get admins
  // todo send to admins
}

async function sendMailAsAnswer(mail: InboundMail) {
  logger.info('Send mail as answer');
  // todo get previous mail 
  // todo get admins
  // todo get previous mail sender
  // todo send 
}

/**
 * Determine if the mail is a answer to a previous email
 */
function isAnswer(mail: InboundMail): boolean {
  return mail.subject.includes('Re:');
}

/**
 * Determine if distibutor is restricted to send 
 */
function isPublic(distributor: IDistributor): boolean {
  return distributor.sendRestricted;
}

/**
 * check if sender is allowed to send mail to distributor
 */
async function isAllowed(sender: string, distributor: IDistributor): Promise<boolean> {
  const user: IUser = await User.findOne({ email: sender })
    .exec();

  if (!user) {
    logger.warn('Send mail failed. Sender not found');
    return false;
  }

  return !!user.allowedDistributors.find(d => d.mailPrefix === distributor.mailPrefix);
}

export function startDistributorService(): void {
  logger.info('startDistributorService');

  const job = new CronJob(
    '*/1 * * * *',
    () => {
      // start distibutor 5 second after cron job to give imap reciever time to start
      setTimeout(() => {
        while (MailInputQueue.Instance.getItems().length !== 0) {
          const mail = MailInputQueue.Instance.dequeue();
          distributeMail(mail);
        }
      }, 5000);
    },
    null,
    true,
    'Europe/Berlin'
  );
}
