const fs = require('fs');
const https = require('https');
const express = require('express');
const conf = require('../libs/configuration');
const logging = require('../libs/logging');


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
 * @return     {Express}  the express server.
 */
async function Main() {
  const configuration = await conf({ env: process.env });
  const log = await logging(configuration.logging);
  let doCertsExists = false;
  try {
    doCertsExists = await certsExists().catch(e => { log.error(e); return false; });
  } catch (e) {
    log.error(e);
  }
  log.debug({ time: START }, 'Application launch');
  process.on('uncaughtException', (err) => {
    log.fatal(err);
    process.exit(1);
  });

  if (doCertsExists) {
    https.createServer({
      key: fs.readFileSync('certs/key.pem'),
      cert: fs.readFileSync('certs/cert.pem'),
    }, app).listen(443);
    log.debug('listening on port 443!');
  } else {
    app.listen(configuration.server.listeningPort, () =>
      log.debug(`listening on port ${configuration.server.listeningPort}!`));
  }

  app.get('/', (req, res) => {
    res.header('Content-type', 'text/html');
    return res.end('<h1>Hello, Secure World!</h1>');
  });

  process.on('uncaughtException', (err) => {
    log.error('Critical Error: uncaught exception failed', err, err.stack);
  });


  return app;
}

Main();
