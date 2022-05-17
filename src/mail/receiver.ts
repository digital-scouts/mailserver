import Connection, { Box, ImapFetch, ImapMessage } from 'imap';
import logger from '../logger';
import imapMails from '../env/mails.json';
import Mail from '../models/mail';
import Distributor, { IDistributor } from '../models/distriburor';

const Imap = require('imap');
const { inspect } = require('util');
const { CronJob } = require('cron');

function createImapConnection() {
  const connections: Array<{ con: Connection; dis: IDistributor }> = [];
  imapMails.forEach(async (mail: { user: string; password: string }) => {
    logger.debug(
      `configure imap for ${mail.user} ${mail.password} to ${process.env.MAIL_IMAP_HOST} on port ${process.env.MAIL_IMAP_PORT}`
    );

    const imap = new Imap({
      user: mail.user,
      password: mail.password,
      host: process.env.MAIL_IMAP_HOST,
      port: process.env.MAIL_IMAP_PORT,
      tls: true
    });
    const distributor = await Distributor.findOne({
      mailPrefix: mail.user.split('@')[0]
    });
    connections.push({ con: imap, dis: distributor });
  });
  return connections;
}

/**
 * normalize the sender of the mail "Sender Name <sender@mail.de>" should be "sender@mail.de"
 */
function normalizeSender(sender: string): string {
  let normalizedSender = sender;
  if (sender.includes('<') && sender.includes('>')) {
    [normalizedSender] = sender.split('<')[1].split('>');
  }
  logger.info(`normalize sender ${sender} to ${normalizedSender}`);
  return normalizedSender;
}

function handleBox(
  openBoxErr: Error,
  box: Box,
  imap: Connection,
  distributor: IDistributor
) {
  if (openBoxErr) throw openBoxErr;

  imap.search(['ALL'], (err: Error, results: Array<any>) => {
    logger.debug(`${results.length} new mails ${inspect(results)}`);
    if (err || !results.length) {
      imap.end();
      return;
    }

    let mail = new Mail();

    const f = imap.fetch(results, {
      bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE X-UID)', 'TEXT']
    });

    f.on('message', (msg: ImapMessage, no: number) => {
      const prefix = `(${(imap as any)['_config'].user.split('@')[0]}-${no})`;
      msg.on('body', (stream, info) => {
        let buffer = '';
        stream.on('data', (chunk: any) => {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', async () => {
          if (info.which !== 'TEXT') {
            const header = Imap.parseHeader(buffer);
            if (!distributor) {
              logger.warn(
                `${prefix} no distributor found for ${
                  (imap as any)['_config'].user
                }`
              );
            }
            logger.debug(inspect(header));
            mail.from = normalizeSender(header.from[0]);
            mail.distributor = distributor;
            [mail.date] = header.date;
            [mail.subject] = header.subject;
            [mail.mailId] = header['x-uid'];
          } else {
            mail.body = buffer;
          }
        });
      });
      msg.once('end', async () => {
        logger.debug(`${prefix}: ${inspect(mail)}`);
        try {
          await mail.save();
        } catch (e) {
          logger.error(`${prefix}: mail with id ${mail.mailId} already exists`);
        }
        mail = new Mail();
        imap.end();
      });
    });
  });
}

function openConnection(imap: Connection, dis: IDistributor) {
  const prefix = `(${(imap as any)['_config'].user.split('@')[0]})`;

  imap.once('ready', () => {
    logger.info(`${prefix} imap ready`);
    imap.openBox('INBOX', true, (err: Error, box: Box) => {
      handleBox(err, box, imap, dis);
    });
  });

  imap.once('alert', (alert: string) => {
    logger.warn(`${prefix} ALERT: ${alert}`);
  });

  imap.once('error', (err: Error) => {
    logger.info(`${prefix} ERROR: ${err}`);
  });

  imap.once('end', () => {
    logger.debug(`${prefix} Connection ended`);
  });

  imap.connect();
}

export function startMailInboxListener() {
  const connections = createImapConnection();

  const job = new CronJob(
    '*/1 * * * *',
    () => {
      connections.forEach((imap: { con: Connection; dis: IDistributor }) => {
        openConnection(imap.con, imap.dis);
      });
    },
    null,
    true,
    'Europe/Berlin'
  );
}
