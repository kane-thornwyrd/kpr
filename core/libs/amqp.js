var amqp = require('amqplib');
const logging = require('./logging');

module.exports = configuration => new Promise(async (res, rej) => {
  const log = await logging(configuration);

  /**
   * Generate a promise to check if the amqp server is available.
   * @param      {Object} amqp the amqp configuration
   *
   * @return     {Promise}  is the amqp server available ?
   */
  const amqpReady = ({amqp: { url, timeout, heartbeat }}, start) =>
    new Promise(async (res, rej) => {
      let out = false;
      let connection;
      while (!out) {
        try {
          connection = await amqp.connect(url, { heartbeat });
        } catch (err) {
          console.debug({ topic: 'IDC' }, err);
        }
        if (connection) {
          out = true;
          return res(connection);
        }
        if (new Date() - start >= timeout) {
          out = true;
          return rej(new Error('AMQP Server not availables'));
        }
      }
      return false;
    });

  let amqpConn;
  let channel;

  res({
    connection: async () => {
      amqpConn = await amqpReady(configuration, new Date());
      channel = await amqpConn.createChannel();
      process.once('SIGINT', function() {
        channel.close();
        amqpConn.close();
      });
      return channel;
    },
    assertQueue: async ({ channel, name, options = {} }) => {
      await channel.assertQueue(name, options.queue);
      log.debug({ topic: 'AMQP Queue', queue: name}, 'asserted');
      return {
        consume: ({ callback, options }) => {
          const LOG_TOPIC = 'AMQP Consume';
          log.debug({ topic: LOG_TOPIC, queue: name }, 'Listening');
          return channel.consume( name, message => {
            let messageParsed;
            try {
              messageParsed = JSON.parse(message.content.toString());
            } catch (error) {
              if (message.fields && message.fields.redelivered) {
                log.error(error, {
                  message,
                  messageParsed,
                  topic: LOG_TOPIC,
                });
                channel.ack(message);
              } else {
                log.warn(error, {
                  message,
                  messageParsed ,
                  topic: LOG_TOPIC,
                }, 'Message failed retrying…');
                channel.nack(message);
              }
            }
            log.debug({ topic: LOG_TOPIC, messageParsed }, 'Message Received');
            return callback(messageParsed);
        }, options )},
        publish: ({ exchange = '', message, options }) => {
          const LOG_TOPIC = 'AMQP Publish';
          log.debug({ topic: LOG_TOPIC, message }, 'Message Sent');
          return channel.publish(exchange, name, new Buffer(JSON.stringify(message), options))
        }
      }
    }
  });

});
