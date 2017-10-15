
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
  console.warn('→→→→→→→→→→→→→→→→→→→→→→→→→→→→→¬ ANSWERED');
});

app.listen(80, () => console.log('Example app listening on port 80!'));

process.on('SIGINT', () => console.log('Goodbye cruel world'));
