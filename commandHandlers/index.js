var amqp = require('amqplib');
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


/**
 * Generate a promise to check if the amqp server is available.
 * Timeout after 60 seconds.
 *
 * @return     {Promise}  is the amqp server available ?
 */
const amqpReady = ({amqp: { amqpUrl }}) => new Promise(async (res, rej) => {
  let out = false;
  let connection;
  while (!out) {
    try {
      connection = await amqp.connect(amqpUrl);
    } catch (err) {
      // boo antipattern caused by a badly implemented library…
      console.debug(err);
    }
    if (connection) {
      out = true;
      return res(connection);
    }
    if (new Date() - START >= 6000) { // 60s×1000
      out = true;
      return rej(new Error('AMQP Server not availables'));
    }
  }
  return false;
});

async function Main() {
  const configuration = await conf({ env: process.env });
  const log = await logging(configuration.logging.commandHandlers);

  const amqpConn = await amqpReady(configuration);
  process.once('SIGINT', function() { amqpConn.close(); });

  const channel = await amqpConn.createChannel();
  const queueReady = await channel.assertQueue('hello', {durable: false});
  if(queueReady) {
    const consumer = channel.consume(
      'hello',
      (msg) =>
        log.debug(`Received "${msg.content.toString()}"`),
      {noAck: true},
    )
    log.debug('Ready to listen!');
  }


}


Main()
  .catch(criticalError);
