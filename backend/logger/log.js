const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.simple()
);


const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

module.exports = logger;

