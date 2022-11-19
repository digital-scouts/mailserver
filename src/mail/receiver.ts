import Connection, { Box, ImapFetch, ImapMessage } from 'imap';
import { CronJob } from 'cron';
import { inspect } from 'util';
import logger from '../logger';
import imapMails from '../env/mails.json';
import Mail from '../models/mail';
import Distributor, { IDistributor } from '../models/distriburor';

const Imap = require('imap');

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

function fixUtf8Chars(body: string): string {
  return Buffer.from(
    body.replace(/=([A-Fa-f0-9]{2})/g, (m, byte) =>
      String.fromCharCode(parseInt(byte, 16))
    ),
    'binary'
  ).toString('utf8');
}

function fixMailBody(buffer: string, contentType: string): string {
  if (contentType === 'text/plain;\tcharset=utf-8') {
    return fixUtf8Chars(buffer);
  }
  if (contentType.includes('multipart/alternative')) {
    const boundary = `--${contentType.split('boundary=')[1].replace(/"/g, '')}`;
    const parts = buffer.split(boundary);
    const textPart = parts.find((part: string) => part.includes('text/plain'));
    if (textPart) {
      const headerParts = textPart.split('\r\n');
      const nonHeaderParts = headerParts.filter(
        (part: string) =>
          !part.includes('Content-Transfer-Encoding:') &&
          !part.includes('Content-Type:') &&
          !part.includes('charset=')
      );
      return fixUtf8Chars(nonHeaderParts.join('\r\n'));
    }
  }

  return buffer;
}

function handleBox(
  openBoxErr: Error,
  box: Box,
  imap: Connection,
  distributor: IDistributor
) {
  if (openBoxErr) throw openBoxErr;

  imap.search(['NEW'], (err: Error, results: Array<any>) => {
    logger.debug(`${results.length} new mails ${inspect(results)}`);
    if (err || !results.length) {
      imap.end();
      return;
    }

    let mail = new Mail();

    const f = imap.fetch(results, {
      bodies: ['HEADER', 'TEXT']
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
            // eslint-disable-next-line prefer-destructuring
            mail.contentType = header['content-type'][0];
            mail.distributor = distributor;
            [mail.date] = header.date;
            [mail.subject] = header.subject;
            [mail.mailId] = header['x-uid'];
          } else {
            mail.body = fixMailBody(buffer, mail.contentType);
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

  // lokal kommt 10x diese meldung
  // (leiter) ERROR: Error: connect ECONNREFUSED 2a01:238:20a:202:54f0::1103:993
  // gefolgt vom fehler
  // todo fix (node:20) MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
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
