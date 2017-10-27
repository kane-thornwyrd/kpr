const amqp = require('./core/libs/amqp');
const conf = require('./core/libs/configuration');
const logging = require('./core/libs/logging');

/**
 * console.error any error passed to it and exit the process.
 *
 * @param      {error}  err     The error
 */
function criticalError(err) {
  console.error('Critical Error: uncaught exception failed', err, err.stack);
  process.exit(1);
}

process.on('uncaughtException', criticalError);

const START = new Date();


async function Main() {
  const configuration = (await conf({ env: process.env })).commandHandlers;
  const log = await logging(configuration);
  const amqpInstance = await amqp(configuration);

  const amqpChannel = await amqpInstance.connection();
  (await amqpInstance.assertQueue({ channel: amqpChannel, name: 'hello' }))
    .consume({ callback: () => log.debug('Received') });
}


Main()
  .catch(criticalError);
