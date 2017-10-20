const bunyan = require('bunyan');

let instance;


module.exports = conf => new Promise((res) => {
  if (!instance) {
    const streams = conf.streams.concat([{
      stream: process.stdout,
      level: conf.logLevel,
    }]);
    instance = bunyan.createLogger({
      level: conf.logLevel,
      name: conf.name,
      streams,
    });
  }
  res(instance);
});
