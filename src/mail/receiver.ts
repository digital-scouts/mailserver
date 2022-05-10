import Connection, { Box, ImapFetch, ImapMessage } from 'imap';
import logger from '../logger';
import imapMails from '../env/mails.json';

const Imap = require('imap');
const { inspect } = require('util');

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
      imap.openBox('INBOX', true, (err: Error, box: Box) => {
        handleBox(err, box, imap);
      });
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
