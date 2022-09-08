import { inspect } from 'util';
import logger from '../logger';
import User, { IUser } from '../models/user';
import * as MailSender from './sender';
import Distributor, { IDistributor } from '../models/distriburor';
import Mail, { IMail } from '../models/mail';

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

async function sendToAllMembers(mail: IMail, distibutor: IDistributor) {
  const recipients = await getRecipients(distibutor);
  MailSender.sendDistributorEmail(
    mail.from,
    recipients,
    mail.subject,
    mail.body,
    mail.distributor
  );
  logger.debug(`Send mail to all members: ${inspect(recipients)}`);
}

async function sendToAdmins(mail: IMail, distibutor: IDistributor) {
  const admins = await getAdmins(distibutor);
  logger.debug(`Send mail to admins: ${inspect(admins)}`);
  MailSender.sendDistributorEmail(
    mail.from,
    admins,
    mail.subject,
    mail.body,
    mail.distributor
  );
}

async function sendMailAsAnswer(mail: IMail) {
  logger.info('Send mail as answer');
  // todo get previous mail
  // todo get admins
  // todo get previous mail sender
  // todo send
}

export function startDistributorService(): void {
  const job = new CronJob(
    '*/1 * * * *',
    () => {
      // start distibutor 5 second after cron job to give imap reciever time to start
      setTimeout(async () => {
        const mails: Array<IMail> = await Mail.find({ send: false })
          .populate('distributor')
          .exec();

        mails.forEach((mail: IMail) => {
          if (mail.isAnswer) {
            sendMailAsAnswer(mail);
            mail.send = true;
            mail.save();
            return;
          }

          if (!mail.distributor.sendRestricted || mail.senderHasPermission) {
            sendToAllMembers(mail, mail.distributor);
            mail.send = true;
            mail.save();
            return;
          }
          sendToAdmins(mail, mail.distributor);

          mail.send = true;
          mail.save();
        });
        logger.debug(`Found ${mails.length} mails to send: ${inspect(mails)}`);
      }, 5000);
    },
    null,
    true,
    'Europe/Berlin'
  );
}
