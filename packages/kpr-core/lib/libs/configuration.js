'use strict';

const { loaders, processors: { json, envToCamelCaseProp } } = require('confabulous');
const Confabulous = require('confabulous');

module.exports = ({ env }) => new Promise((res, rej) => new Confabulous().add(() => loaders.file({ path: `./conf/${env.NODE_ENV || 'dev'}/configuration.json` }, [json()])).add(() => loaders.env([envToCamelCaseProp()])).end((err, config) => {
  if (err) {
    rej(err);
  } else {
    res(config);
  }
}));