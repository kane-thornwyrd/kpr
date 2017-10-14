
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
  console.warn('→→→→→→→→→→→→→→→→→→→→→→→→→→→→→¬ ANSWERED');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));

process.on('SIGINT', () => console.log('Goodbye cruel world'));
