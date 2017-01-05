const chai = require('chai');
const nativeAPI = require('../src/nativeAPI.js');

const expect = chai.expect;
chai.use(require('chai-things'));


describe('nativeAPI', () => {
  it('can retrieve a specific class declaration', () => {
    expect(nativeAPI.get('gp_Pnt').name).to.equal('gp_Pnt');
  });

  it('can retrieve a specific member declaration', () => {
    expect(nativeAPI.get('gp_Pnt::SetX(Standard_Real)').name).to.equal('SetX');
  });

  it('can retrieve several overloaded member declarations', () => {
    expect(nativeAPI.find('gp_Mat::gp_Mat').length).to.equal(4);
  });

  it('can query class declarations by name', () => {
    expect(nativeAPI.find('gp_*').length).to.equal(41);
  });

  it('can query class declarations by decl type', () => {
    var types = nativeAPI.find('gp_Pnt::*', 'method').map(decl => decl.declType);
    expect(types).all.to.equal('method');
  });
});
