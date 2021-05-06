import * as nodemailer from 'nodemailer';
import logger from '../logger';

const { htmlToText } = require('nodemailer-html-to-text');
const hbs = require('nodemailer-express-handlebars');

let connected = false;

// const transporter = nodemailer.createTransport(
//   'smtps://info@jannecklange.de:rCbxWmTT66votw@smtp.strato.de/?pool=true'
// );

const transporter = nodemailer.createTransport({
  pool: true,
  host: 'smtp.strato.de',
  port: 587,
  secure: false,
  auth: {
    user: 'info@jannecklange.de',
    pass: 'rCbxWmTT66votw'
  }
});

transporter.use('compile', htmlToText());
// transporter.use('compile', hbs({
//   viewEngine: '',
//   viewPath: ''
// }));

transporter.verify((error, success) => {
  if (error) {
    logger.error('transporter not verified');
    logger.error(error);
  } else {
    logger.info('transporter.verify');
    connected = true;
  }
});

// eslint-disable-next-line max-len
export function sendDistributorEmail(from: string, to: Array<{ name: string, address: string }>, subject: string, text: string): void {
  const mails: Array<{
    from: { name: string, address: string } | string,
    replyTo: { name: string, address: string } | string,
    to: { name: string, address: string } | string,
    subject: string,
    html: string
  }> = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const t of to) {
    mails.push({
      from: {
        name: 'Pfadfinder Verteiler',
        address: 'info@jannecklange.de'
      },
      replyTo: from,
      to: t,
      subject,
      html: `<html lang="de"><body>
        <p>
            ${text}
        </p>
        <p>
            Custom Footer
        </p>
    </body></html>`
    });
  }

  logger.debug(`MailOptions: ${JSON.stringify(mails)}`);

  // eslint-disable-next-line no-restricted-syntax
  for (const mail of mails) {
    transporter.sendMail(mail, (error, info) => {
      if (error) {
        logger.error(`error: ${error}`);
      }
      logger.info(`Message Sent ${info.response}`);
    });
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
