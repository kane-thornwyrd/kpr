const fs = require('fs');
const https = require('https');
const express = require('express');
const amqp = require('./core/libs/amqp');
const conf = require('./core/libs/configuration');
const logging = require('./core/libs/logging');
const httpsRedirect = require('./core/middlewares/httpsRedirect');
const helmet = require('helmet');
const compression = require('compression');


/**
 * console.error any error passed to it and exit the process.
 *
 * @param      {Error}  error     The error
 * @return {null} nothing
 */
function criticalError(error) {
  /* eslint no-console:0 */
  console.error('Critical Error: uncaught exception failed', error, error.stack);
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
  let out = false;
  while (!out) {
    if (
      fs.existsSync('certs/key.pem') &&
      fs.existsSync('certs/cert.pem')
    ) {
      out = true;
      return res(true);
    }
    if (new Date() - START >= 6000) { // 60s×1000
      out = true;
      return rej(new Error('SSL Certificates not availables'));
    }
  }
  return false;
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

  app.get('/', (req, res) => {
    res.header('Content-type', 'text/html');
    return res.end('<h1>Hello, Secure World!</h1>');
  });

  const amqpChannel = await amqpInstance.connection();
  (await amqpInstance.assertQueue({ channel: amqpChannel, name: 'hello' }))
    .publish({ message: 'HELLO WORLD !' });


  return 0;
}

Main()
  .catch(criticalError);
