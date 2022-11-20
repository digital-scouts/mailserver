import * as nodemailer from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import path from 'path';
import Email from 'email-templates';
import { IDistributor } from '../models/distriburor';
import logger from '../logger';

const { htmlToText } = require('nodemailer-html-to-text');

let transporter: nodemailer.Transporter<SMTPPool.SentMessageInfo> = null;

export function openConnection() {
  transporter = nodemailer.createTransport({
    pool: true,
    host: process.env.MAIL_HOST,
    port: +process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  transporter.use('compile', htmlToText());

  return new Promise(res => {
    transporter.verify((error, success) => {
      if (error) {
        logger.error('transporter not verified');
        logger.error(error);
        transporter = null;
        res(false);
      } else {
        logger.info('transporter verified');
        res(true);
      }
    });
  });
}

export function sendDistributorEmail(
  from: string,
  to: Array<{ name: string; address: string }>,
  subject: string,
  text: string,
  distributor: IDistributor
): void {
  if (transporter === null) {
    logger.warn('Could not send mail. No connection');
    return;
  }

  const email = new Email({
    transport: transporter,
    send: true,
    preview: false
  });

  to.forEach(receiver => {
    const unsubscribeLink = `${process.env.HOST}/unsubscribe?dis=${distributor.name}&sub=${receiver.address}`;
    email
      .send({
        template: path.join(__dirname, 'emails', 'default'),
        message: {
          from: {
            name: 'Pfadfinder Verteiler',
            address: 'info@jannecklange.de'
          },
          to: receiver,
          replyTo: from,
          list: {
            unsubscribe: unsubscribeLink
          }
        },
        locals: {
          name: receiver.name,
          mail: receiver.address,
          subject,
          text,
          distributor: distributor.name,
          unsubscribeLink
        }
      })
      .then(() => logger.info('email has been send!'))
      .catch(logger.error);
  });
}

export function sendMail(to: string, subject: string, text: string) {
  transporter.sendMail(
    {
      from: 'info@jannecklange.de',
      to,
      subject,
      text
    },
    (error, info) => {
      if (error) {
        logger.error(`error: ${error}`);
        logger.error(`mail not send to ${to}`);
      }
      logger.info(`Message Sent ${info.response}`);
    }
  );
}
