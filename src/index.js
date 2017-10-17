const fs = require('fs');

const https = require('https');

const express = require('express');

const app = express();

const START = new Date();

const certsExists = new Promise((res, rej) => {
  let out = false;
  while (!out) {
    if (
      fs.existsSync('certs/key.pem') &&
      fs.existsSync('certs/cert.pem')
    ) {
      out = true;
      res();
    }
    if (new Date() - START >= 6000) { // 60s×1000
      out = true;
      rej();
    }
  }
});

certsExists.then(
  () => {
    https.createServer({
      key: fs.readFileSync('certs/key.pem'),
      cert: fs.readFileSync('certs/cert.pem'),
    }, app).listen(80);
    console.log('listening on port 80 on HTTPS!');
  },
  () => {
    app.listen(80, () => console.log('listening on port 80!'));
  },
);


app.get('/', (req, res) => {
  res.header('Content-type', 'text/html');
  return res.end('<h1>Hello, Secure Whhhhorld!</h1>');
});
