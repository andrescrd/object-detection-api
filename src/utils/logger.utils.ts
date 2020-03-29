import winston from 'winston'
require('winston-daily-rotate-file');

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new (<any>winston.transports).DailyRotateFile({
      filename: 'logs/error-%DATE%.log', level: 'error', handleExceptions: true,
    })
  ]
});

if (process.env.NODE_ENV !== 'pord') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export const logError = (error: Error | string) => {
  if (typeof (error) === 'string') {
    logger.error(error);
  } else {
    logger.error(`error: ${error.message}, stack: ${error.stack}`);
  }
}