const amqp = require('./core/libs/amqp');
const conf = require('./core/libs/configuration');
const logging = require('./core/libs/logging');

/**
 * console.error any error passed to it and exit the process.
 *
 * @param      {Error}  error     The error
 * @return {null} nothing
 */
function criticalError(error) {
  /* eslint no-console:0 */
  console.error('Critical Error: ', error, error.stack);
  process.exit(1);
}

process.on('uncaughtException', criticalError);

async function Main() {
  const START = new Date();
  const configuration = (await conf({ env: process.env })).commandHandlers;
  const log = await logging(configuration);
  log.debug({ topic: 'commandHandlers', time: START }, 'Start');
  const amqpInstance = await amqp(configuration);

  const amqpChannel = await amqpInstance.connection();
  (await amqpInstance.assertQueue({ channel: amqpChannel, name: 'hello' }))
    .consume({ callback: () => log.debug('Received') });
}


Main()
  .catch(criticalError);
