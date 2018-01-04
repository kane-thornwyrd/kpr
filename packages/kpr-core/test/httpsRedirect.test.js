const { expect } = require('chai');
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

const httpsRedirect = require('../src/middlewares/httpsRedirect');

describe('httpsRedirect', () => {
  let stubNext;
  let stubGet;
  let stubRedirect;

  beforeEach(() => {
    stubGet = sandbox.stub();
    stubNext = sandbox.stub();
    stubRedirect = sandbox.stub();
  });

  it('should export a factory', () => {
    expect(typeof httpsRedirect).to.be.equal('function');
    expect(typeof httpsRedirect({ https: {} })).to.be.equal('function');
  });

  it('should only call next when disabled', () => {
    const httpsRedirectMiddleware = httpsRedirect({ https: { disable: true } });
    httpsRedirectMiddleware({ get: stubGet, url: 'fakeUrl' }, { redirect: stubRedirect }, stubNext);
    expect(stubRedirect).to.not.have.been.called();
    expect(stubNext).to.have.been.calledOnce();
  });

  it('should only call next when \'x-forwarded-proto\' is \'https\'', () => {
    stubGet.withArgs('x-forwarded-proto').returns('https');
    const httpsRedirectMiddleware = httpsRedirect({ https: { disable: true } });
    httpsRedirectMiddleware({ get: stubGet, url: 'fakeUrl' }, { redirect: stubRedirect }, stubNext);
    expect(stubRedirect).to.not.have.been.called();
    expect(stubNext).to.have.been.calledOnce();
  });

  it('should redirect to the same url but in https otherwise', () => {
    stubGet.withArgs('host').returns('fakeHost');
    const httpsRedirectMiddleware = httpsRedirect({ https: {} });
    httpsRedirectMiddleware({ get: stubGet, url: 'fakeUrl' }, { redirect: stubRedirect }, stubNext);
    expect(stubRedirect).to.have.been.calledOnce();
    expect(stubNext).to.not.have.been.called();
    expect(stubRedirect).to.have.been.calledWith('https://fakeHostfakeUrl');
  });
});
