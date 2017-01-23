const chai = require('chai');
const configurator = require('../lib/configurator.js');

const expect = chai.expect;
chai.use(require('chai-things'));

describe('Wrapper configuration', () => {
  it('includes builtin types by default', () => {
    var conf = configurator.configure(() => {});
    expect(conf.getMember('builtins')).to.not.equal(undefined);
    expect(conf.getMember('builtins').members.length).to.equal(4);
  });

  it('can define specific classes to be wrapped', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt');
      expect(mod.members.length).to.equal(1);
      expect(mod.getMember('Pnt')).to.not.equal(undefined);
      expect(mod.getMember('Pnt').name).to.equal('Pnt');
      expect(mod.getMember('Pnt').declType).to.equal('class');
    });
  });

  it('can define many wrapped classes with a naming function', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_*');
      expect(mod.getMember('Pnt').name).to.equal('Pnt');
      expect(mod.members.length).to.equal(41);
    });
  });

  it('can exclude or override already wrapped classes', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_*');
      mod.exclude('XYZ');
      expect(mod.members.length).to.equal(40);
      expect(mod.getMember('XYZ')).to.equal(undefined);
    });
  });

  it('can override already wrapped classes', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_*');
      mod.rename('Pnt', 'Point');
      expect(mod.members.length).to.equal(41);
      expect(mod.getMember('Point')).to.not.equal(undefined);
      expect(mod.getMember('Pnt')).to.equal(undefined);
    });
  });

  it('can define methods to be wrapped', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Point', (cls) => {
        cls.wrapMethod('Distance', 'distance')
          .wrapMethod('X', 'x');
      });
      var cls = mod.getMember('Point');
      expect(cls.members.length).to.equal(2);
      expect(cls.members[0].name).to.equal('distance');
    });
  });

  it('can define many wrapped methods at once', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Point', (cls) => {
        cls.wrapMethod('Set*');
      });
      var cls = mod.getMember('Point');
      expect(cls.members.length).to.equal(5);
      expect(cls.getMember('setX').name).to.equal('setX');
    });
  });

  it('can override specific methods', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Point', (cls) => {
        cls.wrapMethod('Set*')
          .rename('setX', 'specialName');
      });

      var cls = mod.getMember('Point');
      expect(cls.getMember('specialName').name).to.equal('specialName');
      expect(cls.getMember('setX')).to.equal(undefined);
      expect(cls.members.length).to.equal(5);
    });
  });

  it('can exclude wrapped methods', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Point', (cls) => {
        cls.wrapMethod('Set*')
          .exclude('setX');
      });

      var cls = mod.getMember('Point');
      expect(cls.members.length).to.equal(4);
      expect(cls.getMember('setX')).to.equal(undefined);
    });
  });

  it('can define overloaded methods', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pln', 'Plane', (cls) => {
        cls.wrapMethod('Distance', 'distance');
      });

      var cls = mod.getMember('Plane');
      expect(cls.members.length).to.equal(1);
      expect(cls.members[0].overloads.length).to.equal(3);
    });
  });

  it('can define wrapped properties', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapProperty('X', 'SetX', 'x');
      });

      var cls = mod.getMember('Pnt');
      expect(cls.getMember('x').declType).to.equal('getter');
      expect(cls.getMember('setX').declType).to.equal('setter');
    });
  });

  it('can define wrapped read-only properties', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapReadOnlyProperty('X', 'x', (prop) => {
          prop.myProperty = 'hello';
        });
      });

      var cls = mod.getMember('Pnt');
      expect(cls.getMember('x').declType).to.equal('getter');
      expect(cls.getMember('x').readOnly).to.equal(true);
      expect(cls.getMember('x').myProperty).to.equal('hello');
    });
  });

  it('removes methods that are accessors to property', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapMethod('*')
          .wrapProperty('X', 'SetX', 'x');
      });

      var cls = mod.getMember('Pnt');
      expect(cls.getMember('x').declType).to.equal('getter');
      expect(cls.getMember('setX').declType).to.equal('setter');
    });
  });

  it('can wrap specific constructors', () => {
    configurator.configure((mod) => {
      mod.wrapClass('Geom_CartesianPoint', 'Point', (cls) => {
        cls.wrapConstructor('gp_Pnt');
      });
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapConstructor('Standard_Real, Standard_Real, Standard_Real')
          .wrapConstructor('');
      });

      var point = mod.getMember('Point');
      var pnt = mod.getMember('Pnt');
      var pointCtor = point.getMember('New');
      expect(pointCtor.declType).to.equal('constructor');
      expect(pointCtor.overloads.length).to.equal(1);
      expect(pointCtor.overloads[0].declType).to.equal('constructorOverload');
      var pntCtor = pnt.getMember('New');
      expect(pntCtor.declType).to.equal('constructor');
      expect(pntCtor.overloads.length).to.equal(2);
    });
  });

  it('can wrap all constructors of a class and exclude copy-constructors', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapConstructor('*');
      });

      var pnt = mod.getMember('Pnt');
      var pntCtor = pnt.getMember('New');
      expect(pntCtor.declType).to.equal('constructor');
      expect(pntCtor.overloads.length).to.equal(3);
    });
  });

  it('can define methods with out args and return them', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapClass('gp_Vec', 'Vec');
      mod.wrapClass('Geom_Geometry', 'Geometry');
      mod.wrapClass('Geom_Curve', 'Curve', (cls) => {
        cls.wrapMethod('D0', 'd0', (method) => {
          method.setOutArgs();
        });
        cls.wrapMethod('D1', 'd1', (method) => {
          method.setOutArgs({ P: 'customNameForP' });
        });
      });

      var curve = mod.getMember('Curve');
      var methodD0 = curve.getMember('d0').overloads[0];
      var methodD1 = curve.getMember('d1').overloads[0];
      expect(!methodD0.args[0].out).to.equal(true);
      expect(methodD0.args[1].out).to.equal(true);
      expect(methodD1.args[1].out).to.equal(true);
      expect(methodD1.args[2].out).to.equal(true);
      expect(methodD1.args[1].name).to.equal('customNameForP');
    });
  });

  it('can configure collections', () => {
    configurator.configure((mod) => {
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapArray1('TColgp_Array1OfPnt', 'gp_Pnt');

      var coll = mod.getMember('Array1OfPnt');
      expect(coll.containedType).to.equal('gp_Pnt');
      var getter = coll.getMember('value');
      var setter = coll.getMember('setValue');
      expect(getter.declType).to.equal('indexedGetter');
      expect(setter.declType).to.equal('indexedSetter');
      expect(getter.overloads[0].args.length).to.equal(0);
      expect(setter.overloads[0].args.length).to.equal(1);
      console.log(coll)
      var ctor = coll.getMember('New');
      console.log(ctor)
      expect(ctor.overloads.length).to.equal(2);
      expect(ctor.overloads[0].declType).to.equal('jsArrayConstructorOverload');
    });
  });
});
