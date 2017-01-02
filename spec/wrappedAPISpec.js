const chai = require('chai');
const configure = require('../src/configure.js');

const expect = chai.expect;
chai.use(require('chai-things'));

describe('Wrapper configuration', () => {
  it('can define specific classes to be wrapped', () => {
    var wrappedAPI = configure((mod) => {
      var cls = mod.wrapClass('gp_Pnt', 'Pnt');
    });
    expect(wrappedAPI.getWrappedType('gp_Pnt').name).to.equal('Pnt');
    expect(wrappedAPI.getNativeType('Pnt').name).to.equal('gp_Pnt');
  });
});
