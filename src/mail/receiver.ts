import Connection, { Box, ImapFetch, ImapMessage } from 'imap';
import logger from '../logger';
import EmailError from '../errors/email-error';
import Distributor, { IDistributor } from '../models/distriburor';
import ServiceMail from '../models/serviceMails';
import User, { IUser } from '../models/user';
import imapMails from '../env/mails.json';

const receiver = require('node-mailin');
const Imap = require('imap');
const { inspect } = require('util');
const serviceMailService = require('./serviceMailService');
const distributorService = require('./distributorService');

export function fakeEmail(content: string, subject: string, to: string) {
  return {
    attachments: [] as string[],
    headers: {},
    html: `<div dir="ltr"><i>${content}</i></div>\n`,
    text: `*${content}*\n`,
    textAsHtml: `<p>*${content}*</p>`,
    subject,
    date: '2021-04-20T18:44:01.000Z',
    to: {
      value: [
        {
          address: to,
          name: ''
        }
      ],
      html: `<span class="mp_address_group"><a href="mailto:${to}" class="mp_address_email">${to}</a></span>`,
      text: to
    },
    from: {
      value: [
        {
          address: 'langejanneck@gmail.com',
          name: 'Janneck Lange'
        }
      ],
      html: '<span class="mp_address_group"><span class="mp_address_name">Janneck Lange</span> &lt;<a href="mailto:langejanneck@gmail.com" class="mp_address_email">langejanneck@gmail.com</a>&gt;</span>',
      text: 'Janneck Lange <langejanneck@gmail.com>'
    },
    messageId:
      '<CAE_JcOhEn7+nGmTwwa9bVi8i4=e18szrrULqBuehUM9c36Z4ag@mail.gmail.com>',
    dkim: 'pass',
    spf: 'pass',
    spamScore: 0,
    language: 'german',
    cc: [] as string[],
    connection: {
      id: '7e2e7061-a11b-4b30-8bc0-64d88809e542',
      secure: true,
      localAddress: '172.30.0.3',
      localPort: 25,
      remoteAddress: '209.85.219.180',
      remotePort: 44822,
      clientHostname: 'mail-yb1-f180.google.com',
      openingCommand: 'EHLO',
      hostNameAppearsAs: 'mail-yb1-f180.google.com',
      xClient: {},
      xForward: {},
      transmissionType: 'ESMTPS',
      tlsOptions: {
        name: 'TLS_AES_256_GCM_SHA384',
        standardName: 'TLS_AES_256_GCM_SHA384',
        version: 'TLSv1.3'
      },
      envelope: {
        mailFrom: {
          address: 'langejanneck@gmail.com',
          args: false
        },
        rcptTo: [
          {
            address: to,
            args: false
          }
        ]
      },
      transaction: 1,
      mailPath: '.tmp/7e2e7061-a11b-4b30-8bc0-64d88809e542'
    },
    envelopeFrom: {
      address: 'langejanneck@gmail.com',
      args: false
    },
    envelopeTo: [
      {
        address: to,
        args: false
      }
    ]
  };
}

async function didDistributorEmailExist(user: string): Promise<boolean> {
  const res = await Distributor.findOne({ mailPrefix: user }).exec();
  return res?.mailPrefix === user;
}

async function didServiceEmailExist(user: string): Promise<boolean> {
  const res = await ServiceMail.findOne({ mailPrefix: user }).exec();
  return res?.mailPrefix === user;
}

export async function receiveMail(data: any) {
  const from = data.from.value[0].address;
  const to = data.to.value[0].address;
  // todo multiple to´s (mehrere Verteiler)
  const { subject, text } = data;
  logger.info(`receiveMail: ${from} ${to} ${subject} ${text}`);

  const targetMailPrefix = to.split('@')[0];
  if (await didServiceEmailExist(targetMailPrefix)) {
    serviceMailService.handleNewServiceMail(
      from,
      targetMailPrefix,
      subject,
      text
    );
  } else if (await didDistributorEmailExist(targetMailPrefix)) {
    distributorService.distributeMail(data);
  } else {
    // should not happen
    logger.warn(`could not sort mail: ${from} ${to} ${subject} ${text}`);
  }
}

export function startMailInboxListener() {
  const connections: Array<Connection> = [];
  imapMails.forEach((mail: { user: string; password: string }) => {
    logger.debug(
      `configure imap for ${mail.user} ${mail.password} to ${process.env.MAIL_IMAP_HOST} on port ${process.env.MAIL_IMAP_PORT}`
    );
    connections.push(
      new Imap({
        user: mail.user,
        password: mail.password,
        host: process.env.MAIL_IMAP_HOST,
        port: process.env.MAIL_IMAP_PORT,
        tls: true
      })
    );
  });

  function handleBox(openBoxErr: Error, box: Box, imap: Connection) {
    logger.info('box ready');
    if (openBoxErr) throw openBoxErr;

    const f: ImapFetch = imap.seq.fetch('0:3', {
      bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
      struct: true
    });

    f.on('message', (msg: ImapMessage, no: number) => {
      logger.info(`Message ${no}`);
      msg.on('body', (stream: any, info: any) => {
        let buffer = '';
        stream.on('data', (chunk: any) => {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', () => {
          logger.info(
            `(${no}) Parsed header: ${inspect(Imap.parseHeader(buffer))}`
          );
        });
      });
      msg.once('attributes', (attrs: any) => {
        logger.info(`(${no}) Attributes: ${inspect(attrs, false, 8)}`);
      });
      msg.once('end', () => {
        logger.info(`(${no}) Finished`);
      });
    });
  }

  connections.forEach((imap: Connection) => {
    imap.once('ready', () => {
      logger.info('imap ready');
      imap.openBox('INBOX', true, (err: Error, box: Box) =>
        handleBox(err, box, imap)
      );
    });

    imap.once('alert', (alert: string) => {
      logger.warn(`ALERT: ${alert}`);
    });

    imap.once('error', (err: Error) => {
      logger.info(err);
    });

    imap.once('end', () => {
      logger.debug('Connection ended');
    });

    imap.connect();
  });
}

export function startMailServerReceiverConnection() {
  receiver.start({
    port: 25,
    disableWebhook: true // Disable the webhook posting.
  });

  /* Access simple-smtp server instance. */
  receiver.on(
    'authorizeUser',
    (
      connection: any,
      username: string,
      password: string,
      done: (arg0: Error, arg1: boolean) => void
    ) => {
      if (username === 'johnsmith' && password === 'mysecret') {
        done(null, true);
      } else {
        done(new Error('Unauthorized!'), false);
      }
    }
  );

  /**
   * Event emitted when the "From" address is received by the smtp server.
   * blocks emails with 530 when user is blocked
   * 530 - Die Nachricht wurde nicht zugestellt
   * 550 - Die Adresse wurde nicht gefunden
   */
  receiver.on(
    'validateSender',
    async (
      session: any,
      address: string,
      callback: (error?: EmailError) => void
    ) => {
      if (address === 'sapzalp@gmail.com') {
        logger.info(`validateSender 530 - user is blocked: ${address}`);
        callback(new EmailError(530, 'You are blocked'));
        return;
      }
      logger.info(`validateSender ok - ${address}`);
      callback();
    }
  );

  /**
   * Event emitted when the "To" address is received by the smtp server.
   * blocks mail with 550 when target email did not exist
   * blocks mail with 530 when sender has no permission to distribute
   * 530 - Die Nachricht wurde nicht zugestellt
   * 550 - Die Adresse wurde nicht gefunden
   */
  receiver.on(
    'validateRecipient',
    async (
      session: any,
      address: string,
      callback: (error?: EmailError) => void
    ) => {
      const targetMailPrefix = address.split('@')[0];
      const targetMailSuffix = address.split('@')[1];
      logger.debug(`validateRecipient - E-Mail Suffix: ${targetMailSuffix}`);
      const userMail = session.envelope.mailFrom.address;
      const distributor: IDistributor = await Distributor.findOne({
        mailPrefix: targetMailPrefix
      }).exec();

      const serviceEmailExist = await didServiceEmailExist(targetMailPrefix);
      if (distributor === null && !serviceEmailExist) {
        logger.info(
          `validateRecipient 550 - Email address not found on server: ${targetMailPrefix}`
        );
        callback(new EmailError(550, 'E-Mail existiert nicht auf dem Server'));
        return;
      }
      if (serviceEmailExist) {
        callback();
        logger.info(
          `validateRecipient ok (to service email) - ${targetMailPrefix}`
        );
        return;
      }
      if (distributor !== null && distributor.sendRestricted) {
        const user: IUser = await User.findOne({ email: userMail }).exec();
        if (user === null) {
          logger.info(
            `validateRecipient 530 - user (${userMail}) did not exist - no permission to distribute: ${targetMailPrefix}`
          );
          callback(
            new EmailError(530, 'Keine Berechtigung diesen Verteiler zu nutzen')
          );
          return;
        }
        const match = user.allowedDistributors.find(
          (allowedDist: IDistributor) =>
            allowedDist._id.toString() === distributor._id.toString()
        );
        if (match === undefined || match === null) {
          logger.info(
            `validateRecipient 530 - user (${userMail}) exist - no permission to distribute: ${targetMailPrefix}`
          );
          callback(
            new EmailError(530, 'Keine Berechtigung diesen Verteiler zu nutzen')
          );
          return;
        }
      }
      logger.info(`validateRecipient ok - ${targetMailPrefix}`);
      callback();
    }
  );

  /* Event emitted after a message was received and parsed. */
  receiver.on('message', (connection: any, data: any, content: any) => {
    receiveMail(data);
  });

  receiver.on('error', (error: any) => {
    logger.error('Mailin error');
    logger.error(error);
  });
}
