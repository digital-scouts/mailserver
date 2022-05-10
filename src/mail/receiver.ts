import Connection, { Box, ImapFetch, ImapMessage } from 'imap';
import logger from '../logger';
import imapMails from '../env/mails.json';
import { MailInputQueue } from './mailInputQueue';
import { InboundMail } from '../models/inboundMail';

const Imap = require('imap');
const { inspect } = require('util');
const { CronJob } = require('cron');

function createImapConnection(): Array<Connection> {
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
  return connections;
}

function handleBox(
  openBoxErr: Error,
  box: Box,
  imap: Connection,
  queue: MailInputQueue
) {
  if (openBoxErr) throw openBoxErr;

  imap.search(['NEW'], (err: Error, results: Array<any>) => {
    logger.debug(`${results.length} new mails ${inspect(results)}`);
    if (err || !results.length) return imap.end();

    let mail = new InboundMail();

    const f = imap.fetch(results, {
      bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT']
    });

    f.on('message', (msg: ImapMessage, no: number) => {
      const prefix = `(${(imap as any)['_config'].user.split('@')[0]}-${no})`;
      msg.on('body', (stream, info) => {
        let buffer = '';
        stream.on('data', (chunk: any) => {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', () => {
          if (info.which !== 'TEXT') {
            const header = Imap.parseHeader(buffer);
            [mail.from] = header.from;
            [mail.to] = (imap as any)['_config'].user.split('@');
            [mail.date] = header.date;
            [mail.subject] = header.subject;
          } else {
            mail.body = buffer;
          }
        });
      });
      msg.once('end', () => {
        logger.debug(`${prefix}: ${inspect(mail)}`);
        queue.enqueue(mail);
        mail = new InboundMail();
        imap.end();
      });
    });
  });
}

function openConnection(imap: Connection, queue: MailInputQueue) {
  const prefix = `(${(imap as any)['_config'].user.split('@')[0]})`;

  imap.once('ready', () => {
    logger.info(`${prefix} imap ready`);
    imap.openBox('INBOX', true, (err: Error, box: Box) => {
      handleBox(err, box, imap, queue);
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

export function startMailInboxListener(queue: MailInputQueue) {
  const connections: Array<Connection> = createImapConnection();

  const job = new CronJob(
    '*/1 * * * *',
    () => {
      connections.forEach((imap: Connection) => {
        openConnection(imap, queue);
      });
      logger.info(`${queue.getItems().length} mails in queue`);
    },
    () => {
      logger.info('Mail inbox listener stopped');
      logger.info(`${queue.getItems().length} mails in queue`);
    },
    true,
    'Europe/Berlin'
  );
}
