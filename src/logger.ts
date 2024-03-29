import {
  createLogger,
  format,
  transports
} from 'winston';
import ConsoleLoggerTransport from './lib/console-logger/winston-transport';

const logTransports = [
  new transports.File({
    level: 'error',
    filename: './logs/error.log',
    format: format.json({
      replacer: (key, value) => {
        if (key === 'error') {
          return {
            message: (value as Error).message,
            stack: (value as Error).stack
          };
        }
        return value;
      }
    })
  }),
  new transports.File({
    level: 'debug',
    filename: './logs/debug.log',
    format: format.json({
      replacer: (key, value) => {
        if (key === 'debug') {
          return {
            message: (value as Error).message,
            stack: (value as Error).stack
          };
        }
        return value;
      }
    })
  }),
  new ConsoleLoggerTransport()
];

const logger = createLogger({
  format: format.combine(
    format.timestamp()
  ),
  transports: logTransports,
  defaultMeta: { service: 'api' },
  level: process.env.NODE_ENV === 'dev' ? 'silly' : 'warn'
});

export default logger;
