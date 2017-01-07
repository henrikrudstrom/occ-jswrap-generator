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
      mod.wrapClass('gp_Pnt', 'Pnt');
      expect(mod.members.length).to.equal(1);
      expect(mod.getMemberByName('Pnt')).to.not.equal(undefined);
      expect(mod.getMemberByName('Pnt').name).to.equal('Pnt');
      expect(mod.getMemberByName('Pnt').type).to.equal('class');
    });
  });

  it('can define many wrapped classes with a naming function', () => {
    configure((mod) => {
      mod.wrapClass('gp_*', util.renameClass);
      expect(mod.getMemberByKey('gp_Pnt').name).to.equal('Pnt');
      expect(mod.members.length).to.equal(41);
    });
  });

  it('can exclude or override already wrapped classes', () => {
    configure((mod) => {
      mod.wrapClass('gp_*', util.renameClass);
      mod.excludeByKey('gp_XYZ');
      expect(mod.members.length).to.equal(40);
      expect(mod.getMemberByKey('gp_XYZ')).to.equal(undefined);
    });
  });

  it('can override already wrapped classes', () => {
    configure((mod) => {
      mod.wrapClass('gp_*', util.renameClass);
      mod.rename('Pnt', 'Point');
      expect(mod.members.length).to.equal(41);
      expect(mod.getMemberByKey('gp_Pnt').name).to.equal('Point');
    });
  });

  it('can define methods to be wrapped', () => {
    configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Point', (cls) => {
        cls.wrapMethod('Distance', 'distance')
         .wrapMethod('X', 'x');
      });
      var cls = mod.getMemberByName('Point');
      expect(cls.members.length).to.equal(2);
      expect(cls.members[0].name).to.equal('distance');
    });
  });

  it('can define many wrapped methods at once', () => {
    configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Point', (cls) => {
        cls.wrapMethod('Set*', util.renameMember);
      });
      var cls = mod.getMemberByName('Point');
      expect(cls.members.length).to.equal(5);
      expect(cls.getMemberByName('setX').name).to.equal('setX');
    });
  });

  it('can override specific methods', () => {
    configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Point', (cls) => {
        cls.wrapMethod('Set*', util.renameMember)
           .rename('setX', 'specialName');
      });

      var cls = mod.getMemberByName('Point');
      expect(cls.getMemberByName('specialName').name).to.equal('specialName');
      expect(cls.getMemberByName('setX')).to.equal(undefined);
      expect(cls.members.length).to.equal(5);
    });
  });

  it('can exclude wrapped methods', () => {
    configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Point', (cls) => {
        cls.wrapMethod('Set*', util.renameMember)
           .excludeByName('setX');
      });

      var cls = mod.getMemberByName('Point');
      expect(cls.members.length).to.equal(4);
      expect(cls.getMemberByName('setX')).to.equal(undefined);
    });
  });

  it('can define overloaded methods', () => {
    configure((mod) => {
      mod.wrapClass('gp_Pln', 'Plane', (cls) => {
        cls.wrapMethod('Distance', 'distance');
      });

      var cls = mod.getMemberByName('Plane');
      expect(cls.members.length).to.equal(1);
      expect(cls.members[0].overloads.length).to.equal(3);
    });
  });

  it('can define wrapped properties', () => {
    configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapProperty('X', 'SetX', 'x');
      });

      var cls = mod.getMemberByName('Pnt');
      expect(cls.getMemberByName('x').type).to.equal('getter');
      expect(cls.getMemberByName('setX').type).to.equal('setter');
    });
  });

  it('can define wrapped read-only properties', () => {
    configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapReadOnlyProperty('X', 'x', (prop) => {
          prop.myProperty = 'hello';
        });
      });

      var cls = mod.getMemberByName('Pnt');
      expect(cls.getMemberByName('x').type).to.equal('getter');
      expect(cls.getMemberByName('x').readOnly).to.equal(true);
      expect(cls.getMemberByName('x').myProperty).to.equal('hello');
    });
  });

  it('removes methods that are accessors to property', () => {
    configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapMethod('*', util.renameMember)
           .wrapProperty('X', 'SetX', 'x');
      });

      var cls = mod.getMemberByName('Pnt');
      expect(cls.getMemberByName('x').type).to.equal('getter');
      expect(cls.getMemberByName('setX').type).to.equal('setter');
    });
  });

  it('can wrap specific constructors', () => {
    configure((mod) => {
      mod.wrapClass('Geom_CartesianPoint', 'Point', (cls) => {
        cls.wrapConstructor('gp_Pnt');
      });
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapConstructor('Standard_Real, Standard_Real, Standard_Real')
           .wrapConstructor('');
      });

      var point = mod.getMemberByName('Point');
      var pnt = mod.getMemberByName('Pnt');
      var pointCtor = point.getMemberByName('Point');
      expect(pointCtor.type).to.equal('constructor');
      expect(pointCtor.overloads.length).to.equal(1);
      expect(pointCtor.overloads[0].type).to.equal('constructorOverload');
      var pntCtor = pnt.getMemberByName('Pnt');
      expect(pntCtor.type).to.equal('constructor');
      expect(pntCtor.overloads.length).to.equal(3);
    });
  });

  it('can wrap all constructors of a class and exclude copy-constructors', () => {
    configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapConstructor('*');
      });

      var pnt = mod.getMemberByName('Pnt');
      var pntCtor = pnt.getMemberByName('Pnt');
      expect(pntCtor.type).to.equal('constructor');
      expect(pntCtor.overloads.length).to.equal(3);
    });
  });
});
