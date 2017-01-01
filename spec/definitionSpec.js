var expect = require('chai').expect;
const configure = require('../src/configure.js');
const util = require('../src/util.js');

describe('Wrapper definition', () => {
  it('it can deduce base classes', () => {
    var wrapperAPI = configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_Geometry', 'Geometry');
    });
    var pointClass = wrapperAPI.getWrapper('Point');
    var geometryClass = wrapperAPI.getWrapper('Geometry');
    expect(pointClass.getBaseClass()).to.equal(geometryClass);
    expect(geometryClass.getBaseClass()).to.equal(undefined);
  });
});
