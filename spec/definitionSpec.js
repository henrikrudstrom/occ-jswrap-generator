const chai = require('chai');
const configure = require('../src/configure.js');
const util = require('../src/util.js');
const WrappedAPI = require('../src/wrappedAPI.js');
const WrapperDefinition = require('../src/model/wrapper.js').Definition;

const expect = chai.expect;
chai.use(require('chai-things'));

describe('Wrapper definition', () => {
  it('it can deduce base classes', () => {
    var conf = configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_Geometry', 'Geometry');
    });
    var def = new WrapperDefinition(new WrappedAPI(conf), null, conf).members[0];
    var pointClass = def.getMemberByName('Point');
    var geometryClass = def.getMemberByName('Geometry');
    expect(pointClass.getBaseClass().name).to.equal(geometryClass.name);
    expect(geometryClass.getBaseClass()).to.equal(undefined);
  });

  it('can distinguish if a class is derived from Standard_Transient or not', () => {
    var conf = configure((mod) => {
      mod.wrapClass('gp_Pln', 'Pln');
      mod.wrapClass('Geom_Plane', 'Plane');
    });
    var def = new WrapperDefinition(new WrappedAPI(conf), null, conf).members[0];
    expect(def.getMemberByName('Pln').hasHandle).to.equal(false);
    expect(def.getMemberByName('Plane').hasHandle).to.equal(true);
  });

  it('knows if method dependencies are wrapped', () => {
    var conf = configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint')
        .wrapMethod('X', 'x')
        .wrapMethod('Pnt', 'pnt')
        .wrapMethod('Transform', 'transform');
    });
    var def = new WrapperDefinition(new WrappedAPI(conf), null, conf).members[0];
    var pointClass = def.getMemberByName('CartesianPoint');
    var methodX = pointClass.getMemberByName('x');
    var methodPnt = pointClass.getMemberByName('pnt');
    var methodTransform = pointClass.getMemberByName('transform');
    expect(methodX.canBeWrapped()).to.equal(true);
    expect(methodPnt.canBeWrapped()).to.equal(true);
    expect(methodTransform.canBeWrapped()).to.equal(false);
  });

  it('can determine if property dependencies are wrapped', () => {
    var conf = configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint')
        .wrapProperty('X', 'SetX', 'x')
        .wrapProperty('Pnt', 'pnt')
        .wrapConstructor('*');
    });
    var def = new WrapperDefinition(new WrappedAPI(conf), null, conf).members[0];
    var pointClass = def.getMemberByName('CartesianPoint');
    var propX = pointClass.getMemberByName('x');
    var propPnt = pointClass.getMemberByName('pnt');
    var ctor = pointClass.getConstructor();
    expect(propX.canBeWrapped()).to.equal(true);
    console.log(propPnt.getWrappedDependencies())
    expect(propPnt.canBeWrapped()).to.equal(false);
    expect(ctor.overloads[0].canBeWrapped()).to.equal(false);
    expect(ctor.overloads[1].canBeWrapped()).to.equal(true);
    expect(ctor.canBeWrapped()).to.equal(true);
  });

  it('can determine which wrapper classes needs to be included', () => {
    var conf = configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('gp_Pnt', 'Pnt')
        .wrapConstructor('*');
      mod.wrapClass('gp_Trsf', 'Trsf');
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint')
        .wrapProperty('X', 'SetX', 'x')
        .wrapProperty('Pnt', 'pnt')
        .wrapMethod('Transform', 'transform');
    });
    var def = new WrapperDefinition(new WrappedAPI(conf), null, conf).members[0];
    var pointClass = def.getMemberByName('CartesianPoint');
    var deps = pointClass.getWrappedDependencies().map(dep => dep.name);
    expect(deps).to.include('Pnt');
    expect(deps).to.include('Point');
    expect(deps).to.include('Trsf');
    expect(deps).not.to.include('double');
  });

  it('should not get wrong objects in declarations list', () => {
    var conf = configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt')
        .wrapMethod('SetX', 'x')
        .wrapConstructor('Standard_Real, Standard_Real, Standard_Real');
    });
    var def = new WrapperDefinition(new WrappedAPI(conf), null, conf).members[0];
    var pnt = def.getMemberByName('Pnt');
    var ctor = pnt.getConstructor();
    expect(ctor).to.not.equal(undefined);
    expect(ctor.declType).to.equal('constructor');
    expect(ctor.overloads.length).to.equal(1);
    expect(ctor.overloads[0].canBeWrapped()).to.equal(true);
  });
});
