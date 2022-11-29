const log4js = require('log4js');

function getLogger() {
  const logger = log4js.getLogger();
  log4js.configure({
    appenders: { cloneError: { type: 'file', filename: 'clone-error.log' } },
    categories: { default: { appenders: ['cloneError'], level: 'error' } },
  });
  logger.level = 'error';
  return logger;
}

module.exports = {
  getLogger,
};
