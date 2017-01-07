const chai = require('chai');
const configure = require('../src/configure.js');
var Factory = require('../src/factory.js').Definition;
var definitions = require('../src/definition');

const expect = chai.expect;
chai.use(require('chai-things'));

describe('Wrapper definition', () => {
  it('includes builtin types by default', () => {
    var conf = configure(() => {});
    var mod = new Factory(definitions.all).create(conf).getMemberByName('builtins');

    expect(mod).to.not.equal(undefined);
    expect(mod.members.length).to.equal(3);
  });

  it('it can deduce base classes', () => {
    var conf = configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_Geometry', 'Geometry');
    });

    var def = new Factory(definitions.all).create(conf).getMemberByName('test');
    var pointClass = def.getMemberByName('Point');
    var geometryClass = def.getMemberByName('Geometry');

    expect(pointClass.getBaseClass().name).to.equal(geometryClass.name);
    expect(geometryClass.getBaseClass()).to.equal(undefined);
  });

  it('can distinguish if a class is derived from Standard_Transient or not', () => {
    var conf = configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pln', 'Pln');
      mod.wrapClass('Geom_Plane', 'Plane');
    });

    var def = new Factory(definitions.all).create(conf).getMemberByName('test');

    expect(def.getMemberByName('Pln').hasHandle).to.equal(false);
    expect(def.getMemberByName('Plane').hasHandle).to.equal(true);
  });

  it('knows if method dependencies are wrapped', () => {
    var conf = configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint', (cls) => {
        cls.wrapMethod('X', 'x')
          .wrapMethod('Pnt', 'pnt')
          .wrapMethod('Transform', 'transform');
      });
    });
    var def = new Factory(definitions.all).create(conf).getMemberByName('test');
    var pointClass = def.getMemberByName('CartesianPoint');
    var methodX = pointClass.getMemberByName('x');
    var methodPnt = pointClass.getMemberByName('pnt');
    var methodTransform = pointClass.getMemberByName('transform');

    expect(methodX.overloads[0].canBeWrapped()).to.equal(true);
    expect(methodX.canBeWrapped()).to.equal(true);

    expect(methodPnt.overloads[0].canBeWrapped()).to.equal(true);
    expect(methodPnt.canBeWrapped()).to.equal(true);

    expect(methodTransform.overloads[0].canBeWrapped()).to.equal(false);
    expect(methodTransform.canBeWrapped()).to.equal(false);
  });

  it('can determine if property dependencies are wrapped', () => {
    var conf = configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint', (cls) => {
        cls.wrapProperty('X', 'SetX', 'x')
          .wrapReadOnlyProperty('Pnt', 'pnt')
          .wrapConstructor('*');
      });
    });
    var def = new Factory(definitions.all).create(conf).getMemberByName('test');
    var pointClass = def.getMemberByName('CartesianPoint');
    var propX = pointClass.getMemberByName('x');
    var setPropX = pointClass.getMemberByName('setX');
    var propPnt = pointClass.getMemberByName('pnt');
    var ctor = pointClass.getConstructor();

    expect(propX.overloads[0].canBeWrapped()).to.equal(true);
    expect(propX.canBeWrapped()).to.equal(true);

    expect(setPropX.overloads[0].canBeWrapped()).to.equal(true);
    expect(setPropX.canBeWrapped()).to.equal(true);

    expect(propPnt.canBeWrapped()).to.equal(false);

    expect(ctor.overloads[0].canBeWrapped()).to.equal(false);
    expect(ctor.overloads[1].canBeWrapped()).to.equal(true);
    expect(ctor.canBeWrapped()).to.equal(true);
  });

  it('can determine which wrapper classes needs to be included', () => {
    var conf = configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapConstructor('*');
      });
      mod.wrapClass('gp_Trsf', 'Trsf');
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint', (cls) => {
        cls.wrapProperty('X', 'SetX', 'x')
          .wrapReadOnlyProperty('Pnt', 'pnt')
          .wrapMethod('Transform', 'transform');
      });
    });

    var def = new Factory(definitions.all).create(conf).getMemberByName('test');
    var pointClass = def.getMemberByName('CartesianPoint');
    var propX = pointClass.getMemberByName('x');
    var propPnt = pointClass.getMemberByName('pnt');

    expect(propX.overloads[0].getWrappedDependencies().length).to.equal(0);
    expect(propPnt.overloads[0].getWrappedDependencies().map(d => d.name)).to.include('Pnt');
    expect(propPnt.getWrappedDependencies().map(d => d.name)).to.include('Pnt');

    var deps = pointClass.getWrappedDependencies().map(dep => dep.name);
    expect(deps).to.include('Pnt');
    expect(deps).to.include('Point');
    expect(deps).to.include('Trsf');
    expect(deps).not.to.include('double');
  });

  it('should not get wrong objects in declarations list', () => {
    var conf = configure((mod) => {
      mod.name = 'test'
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapMethod('SetX', 'x')
          .wrapConstructor('Standard_Real, Standard_Real, Standard_Real');
      });
    });

    var def = new Factory(definitions.all).create(conf).getMemberByName('test');
    var pnt = def.getMemberByName('Pnt');
    var ctor = pnt.getConstructor();

    expect(ctor).to.not.equal(undefined);
    expect(ctor.type).to.equal('constructor');
    expect(ctor.overloads.length).to.equal(1);
    expect(ctor.overloads[0].canBeWrapped()).to.equal(true);
  });

  it('should not get wrong objects in declarations list', () => {
    var conf = configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapConstructor('Standard_Real, Standard_Real, Standard_Real');
      });
    });
    var def = new Factory(definitions.all).create(conf).getMemberByName('test');
    var pnt = def.getMemberByName('Pnt');
    expect(pnt.getMemberByName('Pnt').overloads[0].type).to.equal('constructorOverload');
  });
});
