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

  it('knows if method dependencies are wrapped', () => {
    var wrapperAPI = configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint')
        .wrapMethod('X', 'x')
        .wrapMethod('Pnt', 'pnt')
        .wrapMethod('Transform', 'transform');
    });
    var pointClass = wrapperAPI.getWrapper('CartesianPoint');
    var methodX = pointClass.getMemberByName('x');
    var methodPnt = pointClass.getMemberByName('pnt');
    var methodTransform = pointClass.getMemberByName('transform');

    expect(methodX.canBeWrapped()).to.equal(true);
    expect(methodPnt.canBeWrapped()).to.equal(true);
    expect(methodTransform.canBeWrapped()).to.equal(false);
  });

  it('can determine if property dependencies are wrapped', () => {
    var wrapperAPI = configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint')
        .wrapProperty('X', 'SetX', 'x')
        .wrapProperty('Pnt', 'pnt');
    });
    var pointClass = wrapperAPI.getWrapper('CartesianPoint');
    var propX = pointClass.getMemberByName('x');
    var propPnt = pointClass.getMemberByName('pnt');

    expect(propX.canBeWrapped()).to.equal(true);
    expect(propPnt.canBeWrapped()).to.equal(false);
  });

  it('can determine which wrapper classes needs to be included', () => {
    var wrapperAPI = configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapClass('gp_Trsf', 'Trsf');
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint')
        .wrapProperty('X', 'SetX', 'x')
        .wrapProperty('Pnt', 'pnt')
        .wrapMethod('Transform', 'transform');
    });
    var pointClass = wrapperAPI.getWrapper('CartesianPoint');
    var deps = pointClass.getWrappedDependencies().map(dep => dep.name);
    expect(deps).to.include('Pnt');
    expect(deps).to.include('Point');
    expect(deps).to.include('Trsf');
  });
});
