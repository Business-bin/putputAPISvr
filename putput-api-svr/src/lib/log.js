const chalk = require('chalk');
const Moment = require('moment');

function getDateTime() {
  const now = new Moment();
  const dateTime = chalk.dim(`[${now.format('YYYY-MM-DD HH:mm:ss')}]`);
  return dateTime;
}

function log(...message) {
  const dateTime = getDateTime();
  const type = chalk.bold('[LOG]');
  console.log(`${dateTime}${type}`, ...message);
}

log.info = (...message) => {
  const dateTime = getDateTime();
  const type = chalk.bold(chalk.cyan('[INFO]'));
  console.log(`${dateTime}${type}`, ...message);
};

log.error = (...message) => {
  const dateTime = getDateTime();
  const type = chalk.bold(chalk.red('[ERROR]'));
  console.log(`${dateTime}${type}`, ...message);
};

module.exports = log;