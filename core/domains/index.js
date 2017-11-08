const EventEmitter = require('events');
const { Duplex } = require('stream');

const requireDir = require('require-dir');

class JsonOutput extends Duplex {
  constructor(options) {
    super(options);
  }

  _read(size){
    console.log('READAAAAAAAAAAAAAAAA',size);
  }
}

const dir = requireDir();

const eventEmitters = {};

module.exports = ({ app }) => {
  Object.keys(dir).forEach(mod => {

    if(app) {
      // I'm using the string representation of the regexes and not the result of
      // them against the path to avoid loosing too much perfs.
      // (very) Bad Side effects:
      //  * we have to always add new verb/regex to the zender.
      //  * there is gap in information processing formed by the fact that
      //    multiple regexes can match the same path… And:
      //    1. They WILL be processed independently
      //    2. An error will occure while 2 or more streams will try to write the
      //        response
      // How to avoid those issues:
      //  * Be very cautious while creating new routes
      //  * Stop ReST , go GraphQL !!!
      Object.keys(dir[mod].routes).forEach(verb => {
        dir[mod].routes[verb].forEach(pathConf => {
          if(!eventEmitters[pathConf.path]) {
            eventEmitters[pathConf.path] = new JsonOutput({
              readableObjectMode: true,
              writableObjectMode: true,
            });

            eventEmitters[pathConf.path].on('data',
              (...args) => console.log('OOOOOOOOOOOOOO', args));
          }
          eventEmitters[pathConf.path].on(verb, pathConf.operation);
          app.route(pathConf.path)[verb]((req, res, next) =>
            eventEmitters[pathConf.path].emit(verb, eventEmitters[pathConf.path]));
        })
      });
    }

  });
};

