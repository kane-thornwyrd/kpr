module.exports.middlewares = {};
module.exports.middlewares.httpsRedirect = require('./middlewares/httpsRedirect');

module.exports.libs = {};
module.exports.libs.amqp = require('./libs/amqp');
module.exports.libs.configuration = require('./libs/configuration');
module.exports.libs.logging = require('./libs/logging');
