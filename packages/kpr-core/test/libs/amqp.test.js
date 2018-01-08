const { expect } = require('chai');
const sinon = require('sinon');
const amqpLib = require('amqplib');

const sandbox = sinon.sandbox.create();

const amqp = require('../../src/libs/amqp');
const logging = require('../../src/libs/logging');

describe('amqp', () => {
  let stubAmqp;
  let stubAmqpArgs;
  let stubAmqpLibConnect;
  let stubLogging;
  let TARDIS;

  beforeEach(() => {
    stubAmqp = {
      close: sandbox.stub(),
      createChannel: sandbox.stub(),
    };
    stubAmqpArgs = sandbox.stub().returns({ amqp: { url: 'fakeUrl', timeout: 300, heartbeat: true } });

    stubAmqpLibConnect = sandbox.stub(amqpLib, 'connect');

    stubLogging = {
      log: sandbox.stub(),
      debug: sandbox.stub(),
      error: sandbox.stub(),
      warn: sandbox.stub(),
    };
    sandbox.stub(logging, 'log').returns(stubLogging);

    TARDIS = sinon.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
    TARDIS.restore();
  });

  it('should export a factory of promise', () => {
    expect(amqp.amqp).to.be.a('function');
    expect(amqp.amqp(stubAmqpArgs())).to.be.an.instanceOf(Promise);
  });

  describe('amqpReady', () => {
    it('return an amqp connection if available', async () => {
      stubAmqpLibConnect.resolves(stubAmqp);
      const conf = Object.assign({}, stubAmqpArgs(), { log: logging.log() });

      const amqpReady = sandbox.spy(amqp.amqpReady(conf, 0));

      expect(await amqpReady()).to.be.equal(stubAmqp);
    });

    it('should timeout if no amqp connection is available after a while', async () => {
      stubAmqpLibConnect.rejects();
      const conf = Object.assign({}, stubAmqpArgs(), { log: logging.log() });

      const amqpReady = sandbox.spy(amqp.amqpReady(conf, 0));

      TARDIS.tick(301);

      try {
        expect(await amqpReady()).to.have.been.rejectedWith('AMQP Server not availables');
      } catch (e) {} // eslint-disable-line no-empty
    });
  });
});
