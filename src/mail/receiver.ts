import logger from '../logger';
import EmailError from '../errors/email-error';
import Distributor from '../models/distriburor';
import ServiceMail from '../models/serviceMails';

const receiver = require('node-mailin');
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
    messageId: '<CAE_JcOhEn7+nGmTwwa9bVi8i4=e18szrrULqBuehUM9c36Z4ag@mail.gmail.com>',
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
  const res = await Distributor.findOne({ user })
    .exec();
  return res?.user === user;
}

async function didServiceEmailExist(user: string): Promise<boolean> {
  const res = await ServiceMail.findOne({ user })
    .exec();
  return res?.user === user;
}

export async function receiveMail(data: any) {
  const from = data.from.value[0].address;
  const to = data.to.value[0].address;
  const {
    subject,
    text
  } = data;
  logger.info(`receiveMail: ${from} ${to} ${subject} ${text}`);

  const user = to.split('@')[0];
  if (await didServiceEmailExist(user)) {
    serviceMailService.handleNewServiceMail(from, user, subject, text);
  } else if (await didDistributorEmailExist(user)) {
    distributorService.handleNewDistribution(from, user, subject, text);
  } else {
    logger.warn(`could not sort mail: ${from} ${to} ${subject} ${text}`);
  }
}

receiver.start({
  port: 25,
  disableWebhook: true, // Disable the webhook posting.
  SMTPBanner: 'Hi from a custom Mailin instance'
});

/* Access simplesmtp server instance. */
receiver.on('authorizeUser', (connection: any, username: string, password: string, done: (arg0: Error, arg1: boolean) => void) => {
  if (username === 'johnsmith' && password === 'mysecret') {
    done(null, true);
  } else {
    done(new Error('Unauthorized!'), false);
  }
});

/* Event emitted when the "From" address is received by the smtp server. */
// eslint-disable-next-line max-len
receiver.on('validateSender', async (session: any, address: string, callback: (error?: EmailError) => void) => {
  if (address === 'sapzalp@gmail.com') { /* blacklist a specific email address*/
    logger.info(`validateSender - user is blocked: ${address}`);
    callback(new EmailError(530, 'You are blocked'));
  } else {
    callback();
  }
});

/* Event emitted when the "To" address is received by the smtp server. */
receiver.on('validateRecipient', async (session: any, address: string, callback: (error?: EmailError) => void) => {
  const user = address.split('@')[0];
  if (!await didDistributorEmailExist(user) && !await didServiceEmailExist(user)) {
    logger.info(`validateRecipient - user did not exist: ${user}`);
    callback(new EmailError(550, 'Email address not found on server'));
  }
  callback();
});

/* Event emitted after a message was received and parsed. */
receiver.on('message', (connection: any, data: any, content: any) => {
  receiveMail(data);
});
