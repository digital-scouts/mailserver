import * as nodemailer from 'nodemailer';
import logger from '../logger';

const { htmlToText } = require('nodemailer-html-to-text');
const Email = require('email-templates');
const path = require('path');

let transporter: import('nodemailer/lib/mailer') = null;

export function openConnection() {
  transporter = nodemailer.createTransport({
    pool: true,
    host: process.env.MAIL_HOST,
    port: +process.env.MAIL_PORT,
    secure: false,
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

// eslint-disable-next-line max-len
export function sendDistributorEmail(from: string, to: Array<{ name: string, address: string }>, subject: string, text: string, distributor: string): void {
  if (transporter === null) {
    logger.warn('Could not send mail. No connection');
    return;
  }

  const email = new Email({
    transport: transporter,
    send: true,
    preview: false
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const receiver of to) {
    const unsubscribeLink = `${process.env.HOST}/unsubscribe?dis=${distributor}&sub=${receiver.address}`;
    email.send({
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
        distributor,
        unsubscribeLink
      }
    })
      .then(() => logger.info('email has been send!'))
      .catch(logger.error);
  }
}

export function sendMail(to: string, subject: string, text: string) {
  transporter.sendMail({
    from: 'info@jannecklange.de',
    to,
    subject,
    text
  }, (error, info) => {
    if (error) {
      logger.error(`error: ${error}`);
    }
    logger.info(`Message Sent ${info.response}`);
  });
}
