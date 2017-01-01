var expect = require('chai').expect;
const nativeAPI = require('../src/nativeAPI.js');

describe('nativeAPI', () => {
  it('can retrieve a specific class declaration', () => {
    expect(nativeAPI.get('gp_Pnt').name).to.equal('gp_Pnt');
  });

  it('can retrieve a specific member declaration', () => {
    expect(nativeAPI.get('gp_Pnt.SetX(Standard_Real)').name).to.equal('SetX');
  });

  it('can retrieve several overloaded member declarations', () => {
    expect(nativeAPI.get('gp_Mat.gp_Mat').length).to.equal(4);
  });

  it('can query class declarations by name', () => {
    expect(nativeAPI.get('gp_*').length).to.equal(41);
  });
});
