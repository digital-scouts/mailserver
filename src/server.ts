import * as dotenv from 'dotenv';
import util from 'util';
import app from './app';
import SafeMongooseConnection from './lib/safe-mongoose-connection';
import logger from './logger';
import * as init from './services/databaseLoaderService';
import * as mailSender from './mail/sender';
import * as mailReceiver from './mail/receiver';

const result = dotenv.config();
if (result.error) {
  dotenv.config({
    path: `${__dirname}/env/.env.${
      process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'
    }`
  });
}

const PORT = process.env.PORT || 3000;

let debugCallback = null;
if (process.env.NODE_ENV === 'dev') {
  debugCallback = (
    collectionName: string,
    method: string,
    query: any,
    doc: string
  ): void => {
    const message = `${collectionName}.${method}(${util.inspect(query, {
      colors: true,
      depth: null
    })})`;
    logger.log({
      level: 'silly',
      message,
      consoleLoggerOptions: { label: 'MONGO' }
    });
  };
}

const safeMongooseConnection = new SafeMongooseConnection({
  mongoUrl: process.env.MONGO_URL,
  debugCallback,
  onStartConnection: (mongoUrl: string) => {
    init.databaseLoaderService();
    logger.info(`Connecting to MongoDB at ${mongoUrl}`);
  },
  onConnectionError: (error, mongoUrl) =>
    logger.log({
      level: 'error',
      message: `Could not connect to MongoDB at ${mongoUrl}`,
      error
    }),
  onConnectionRetry: (mongoUrl: string) =>
    logger.info(`Retrying to MongoDB at ${mongoUrl}`)
});

const shutdown = () => {
  console.log('\n'); /* eslint-disable-line */
  logger.info('Gracefully shutting down');
  logger.info('Closing the MongoDB connection');
  safeMongooseConnection.close((err: Error) => {
    if (err) {
      logger.log({
        level: 'error',
        message: 'Error shutting closing mongo connection',
        error: err
      });
    } else {
      logger.info('Mongo connection closed successfully');
    }
    process.exit(0);
  }, true);
};

const serve = () =>
  app.listen(PORT, async () => {
    if (!(await mailSender.openConnection())) {
      logger.warn('Mail sender connection could not established -> SHUTDOWN');
      shutdown();
    }

    mailReceiver.startMailInboxListener();

    logger.debug(
      `🌏 Express server started at http://localhost:${PORT} with ${process.env.NODE_ENV} environment variables`
    );
    if (process.env.NODE_ENV === 'dev') {
      // This route is only present in development mode
      logger.debug(
        `⚙️  Swagger UI hosted at http://localhost:${PORT}/dev/api-docs`
      );
    }
  });

if (process.env.MONGO_URL == null) {
  logger.error('MONGO_URL not specified in environment');
  process.exit(1);
} else {
  safeMongooseConnection.connect((mongoUrl: string) => {
    logger.info(`Connected to MongoDB at ${mongoUrl}`);
    serve();
  });
}

// Close the Mongoose connection, when receiving SIGINT
process.on('SIGINT', () => {
  shutdown();
});
