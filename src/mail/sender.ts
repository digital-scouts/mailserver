import * as nodemailer from 'nodemailer';
import logger from '../logger';

const transporter = nodemailer.createTransport(
  'smtps://info@jannecklange.de:rCbxWmTT66votw@smtp.strato.de/?pool=true'
);

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
