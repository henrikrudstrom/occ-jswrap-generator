const chai = require('chai');
const configure = require('../src/configure.js');
const util = require('../src/util.js');

require('../src/definition');

const expect = chai.expect;
chai.use(require('chai-things'));

describe('Wrapper configuration', () => {
  it('includes builtin types by default', () => {
    var conf = configure(() => {});
    expect(conf.getMemberByName('builtins')).to.not.equal(undefined);
    expect(conf.getMemberByName('builtins').members.length).to.equal(3);
  });

  it('can define specific classes to be wrapped', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pnt', 'Pnt');
      expect(cls.name).to.equal('Pnt');
      expect(mod.members.length).to.equal(1);
      expect(mod.getMemberByKey('gp_Pnt')).to.not.equal(undefined);
      expect(mod.getMemberByName('Pnt')).to.not.equal(undefined);
    });
  });

  it('can define many wrapped classes with a naming function', () => {
    configure((mod) => {
      mod.wrapClasses('gp_*', util.renameClass);
      expect(mod.getMemberByKey('gp_Pnt').name).to.equal('Pnt');
      expect(mod.members.length).to.equal(41);
    });
  });

  it('can exclude or override already wrapped classes', () => {
    configure((mod) => {
      mod.wrapClasses('gp_*', util.renameClass);
      mod.excludeByKey('gp_XYZ');
      expect(mod.members.length).to.equal(40);
      expect(mod.getMemberByKey('gp_XYZ')).to.equal(undefined);
    });
  });

  it('can override already wrapped classes', () => {
    configure((mod) => {
      mod.wrapClasses('gp_*', util.renameClass);
      mod.rename('Pnt', 'Point');
      expect(mod.members.length).to.equal(41);
      expect(mod.getMemberByKey('gp_Pnt').name).to.equal('Point');
    });
  });

  it('can define methods to be wrapped', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pnt', 'Point')
        .wrapMethod('Distance', 'distance')
        .wrapMethod('X', 'x');

      expect(cls.members.length).to.equal(2);
      expect(cls.members[0].name).to.equal('distance');
    });
  });

  it('can define many wrapped methods at once', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pnt', 'Point')
        .wrapMethod('Set*', util.renameMember);
      expect(cls.members.length).to.equal(5);
      expect(cls.getMemberByName('setX').name).to.equal('setX');
    });
  });

  it('can override specific methods', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pnt', 'Point')
        .wrapMethod('Set*', util.renameMember)
        .rename('setX', 'specialName');

      expect(cls.getMemberByName('specialName').name).to.equal('specialName');
      expect(cls.getMemberByName('setX')).to.equal(undefined);
      expect(cls.members.length).to.equal(5);
    });
  });

  it('can exclude wrapped methods', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pnt', 'Point')
        .wrapMethod('Set*', util.renameMember)
        .excludeByName('setX');

      expect(cls.members.length).to.equal(4);
      expect(cls.getMemberByName('setX')).to.equal(undefined);
    });
  });

  it('can define overloaded methods', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pln', 'Plane')
        .wrapMethod('Distance', 'distance');

      expect(cls.members.length).to.equal(1);
      expect(cls.members[0].overloads.length).to.equal(3);
    });
  });

  it('can define wrapped properties', () => {
    configure((mod) => {
      var pnt = mod.wrapClass('gp_Pnt', 'Pnt')
        .wrapProperty('X', 'SetX', 'x');

      expect(pnt.getMemberByName('x').type).to.equal('getter');
      expect(pnt.getMemberByName('setX').type).to.equal('setter');
      //expect(pnt.getMemberByName('x').readOnly).to.equal(false);
    });
  });

  it('can define wrapped read-only properties', () => {
    configure((mod) => {
      var pnt = mod.wrapClass('gp_Pnt', 'Pnt')
        .wrapReadOnlyProperty('X', 'x', (prop) => {
          console.log("SDFSDF")
          console.log(prop)
          prop.myProperty = 'hello';
        });

      expect(pnt.getMemberByName('x').type).to.equal('getter');
      expect(pnt.getMemberByName('x').readOnly).to.equal(true);
      expect(pnt.getMemberByName('x').myProperty).to.equal('hello');
    });
  });

  it('removes methods that are accessors to property', () => {
    configure((mod) => {
      var pnt = mod.wrapClass('gp_Pnt', 'Pnt')
        .wrapMethod('*', util.renameMember)
        .wrapProperty('X', 'SetX', 'x');

      expect(pnt.getMemberByName('x').type).to.equal('getter');
      expect(pnt.getMemberByName('setX').type).to.equal('setter');
    });
  });

  it('can wrap specific constructors', () => {
    configure((mod) => {
      var point = mod.wrapClass('Geom_CartesianPoint', 'Point')
        .wrapConstructor('gp_Pnt');
      var pnt = mod.wrapClass('gp_Pnt', 'Pnt')
        .wrapConstructor('Standard_Real, Standard_Real, Standard_Real')
        .wrapConstructor('');

      var pointCtor = point.getMemberByName('Point');
      expect(pointCtor.type).to.equal('constructor');
      expect(pointCtor.overloads.length).to.equal(1);

      var pntCtor = pnt.getMemberByName('Pnt');
      expect(pntCtor.type).to.equal('constructor');
      expect(pntCtor.overloads.length).to.equal(3);
    });
  });

  it('can wrap all constructors of a class and exclude copy-constructors', () => {
    configure((mod) => {
      var pnt = mod.wrapClass('gp_Pnt', 'Pnt')
        .wrapConstructor('*');

      var pntCtor = pnt.getMemberByName('Pnt');
      expect(pntCtor.type).to.equal('constructor');
      expect(pntCtor.overloads.length).to.equal(3);
    });
  });
});
