const fs = require('fs');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');

const { libs: { logging: { logging } } } = require('kpr-core');
const { libs: { configuration: conf } } = require('kpr-core');
const { libs: { amqp: { amqp } } } = require('kpr-core');

const { middlewares: { httpsRedirect } } = require('kpr-core');

// const domains = require('./core/domains');


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

const START = new Date();

const app = express();

/**
 * Generate a promise to check if the certificates are available.
 * Timeout after 60 seconds.
 *
 * @return     {Promise}  are the certificate available ?
 */
const certsExists = () => new Promise((res, rej) => {
  const requestCertStart = new Date();
  while (new Date() - requestCertStart < 600) {
    if (
      fs.existsSync('certs/key.pem') &&
      fs.existsSync('certs/cert.pem')
    ) {
      return res(true);
    }
  }
  return rej(new Error('SSL Certificates not availables'));
});

/**
 * Main application runtime.
 *
 * @return     {Number} 0.
 */
async function Main() {
  const configuration = (await conf({ env: process.env })).dispatcher;
  const log = await logging(configuration);
  const amqpInstance = await amqp(configuration);

  let doCertsExists = false;
  try {
    doCertsExists = await certsExists().catch(e => { log.error(e); return false; });
  } catch (error) {
    log.error(error);
  }
  log.debug({ topic: 'dispatcher', time: START }, 'Start');

  const weAreLive = () => log.debug(`✔ Dispatcher online, listening on ${configuration.server.listeningPort}`);

  if (doCertsExists) {
    https.createServer({
      key: fs.readFileSync('certs/key.pem'),
      cert: fs.readFileSync('certs/cert.pem'),
    }, app).listen(configuration.server.listeningPort, weAreLive);
  } else {
    app.listen(configuration.server.listeningPort, weAreLive);
  }

  app.use(compression());
  app.use(httpsRedirect({ https: { disable: !doCertsExists } }));
  app.use(helmet());

  // domains({ app });

  app.get('/', (req, res) => {
    res.header('Content-type', 'text/html');
    return res.end('<h1>Hello, Secure World!</h1>');
  });

  const amqpChannel = await amqpInstance.connection();
  if (amqpChannel) {
    (await amqpInstance.assertQueue({ channel: amqpChannel, name: 'hello' }))
      .publish({ message: 'HELLO WORLD !' });
  }


  return 0;
}

Main()
  .catch(criticalError);
