const chai = require('chai');
const configurator = require('../lib/configurator.js');

const expect = chai.expect;
chai.use(require('chai-things'));

describe('Wrapper definition', () => {
  it('includes builtin types by default', () => {
    var conf = configurator.configure(() => {});
    var mod = configurator.createModel(conf).getMember('builtins');

    expect(mod).to.not.equal(undefined);
    expect(mod.members.length).to.equal(3);
  });

  it('it can deduce base classes', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_Geometry', 'Geometry');
    });

    var def = configurator.createModel(conf).getMember('test');
    var pointClass = def.getMember('Point');
    var geometryClass = def.getMember('Geometry');

    expect(pointClass.getBaseClass().name).to.equal(geometryClass.name);
    expect(geometryClass.getBaseClass()).to.equal(undefined);
  });

  it('can distinguish if a class is derived from Standard_Transient or not', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pln', 'Pln');
      mod.wrapClass('Geom_Plane', 'Plane');
    });

    var def = configurator.createModel(conf).getMember('test');

    expect(def.getMember('Pln').hasHandle).to.equal(false);
    expect(def.getMember('Plane').hasHandle).to.equal(true);
  });

  it('knows if method dependencies are wrapped', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapClass('Geom_Point', 'Point', (cls) => {
        cls.wrapMethod('Distance', 'distance');
      });
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint', (cls) => {
        cls.wrapMethod('X', 'x')
          .wrapMethod('Pnt', 'pnt')
          .wrapMethod('Transform', 'transform');
      });
    });
    var def = configurator.createModel(conf).getMember('test');
    var pointClass = def.getMember('CartesianPoint');
    var methodX = pointClass.getMember('x');
    var methodPnt = pointClass.getMember('pnt');
    var methodTransform = pointClass.getMember('transform');
    var baseClass = def.getMember('Point');
    var methodDistance = baseClass.getMember('distance');
    expect(methodX.overloads[0].canBeWrapped()).to.equal(true);
    expect(methodX.canBeWrapped()).to.equal(true);

    expect(methodPnt.overloads[0].canBeWrapped()).to.equal(true);
    expect(methodPnt.canBeWrapped()).to.equal(true);

    expect(methodTransform.overloads[0].canBeWrapped()).to.equal(false);
    expect(methodTransform.canBeWrapped()).to.equal(false);

    expect(methodDistance.overloads[0].canBeWrapped()).to.equal(true);
    expect(methodDistance.canBeWrapped()).to.equal(true);
  });

  it('can determine if property dependencies are wrapped', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('Geom_Point', 'Point', (cls) => {
        cls.wrapMethod('Distance', 'distance');
      });
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint', (cls) => {
        cls.wrapProperty('X', 'SetX', 'x')
          .wrapReadOnlyProperty('Pnt', 'pnt')
          .wrapConstructor('*');
      });
    });
    var def = configurator.createModel(conf).getMember('test');
    var cartesianPointClass = def.getMember('CartesianPoint');
    var pointClass = def.getMember('Point');
    var propX = cartesianPointClass.getMember('x');
    var setPropX = cartesianPointClass.getMember('setX');
    var propPnt = cartesianPointClass.getMember('pnt');
    var ctor = cartesianPointClass.getConstructor();

    var distance = pointClass.getMember('distance');
    expect(distance.overloads[0].canBeWrapped()).to.equal(true);
    expect(distance.canBeWrapped()).to.equal(true);

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
    var conf = configurator.configure((mod) => {
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

    var def = configurator.createModel(conf).getMember('test');
    var cartesianPointClass = def.getMember('CartesianPoint');
    var propX = cartesianPointClass.getMember('x');
    var propPnt = cartesianPointClass.getMember('pnt');

    expect(propX.overloads[0].getWrappedDependencies().length).to.equal(0);
    expect(propPnt.overloads[0].getWrappedDependencies().map(d => d.name)).to.include('Pnt');
    expect(propPnt.getWrappedDependencies().map(d => d.name)).to.include('Pnt');

    var deps = cartesianPointClass.getWrappedDependencies().map(dep => dep.name);
    expect(deps).to.include('Pnt');
    expect(deps).to.include('Point');
    expect(deps).to.include('Trsf');
    expect(deps).not.to.include('double');
  });

  it('it includes empty constructor by default', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt');
    });
    var def = configurator.createModel(conf).getMember('test');
    var ctor = def.getMember('Pnt').getConstructor();
    expect(ctor).to.not.equal(undefined);
    expect(ctor.name).to.equal('New');
    expect(ctor.overloads.length).to.equal(0);
    expect(ctor.canBeWrapped()).to.equal(true);
  });

  it('should not get wrong objects in declarations list', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapMethod('SetX', 'x')
          .wrapConstructor('Standard_Real, Standard_Real, Standard_Real');
      });
    });

    var def = configurator.createModel(conf).getMember('test');
    var pnt = def.getMember('Pnt');
    var ctor = pnt.getConstructor();

    expect(ctor).to.not.equal(undefined);
    expect(ctor.declType).to.equal('constructor');
    expect(ctor.overloads.length).to.equal(1);
    expect(ctor.overloads[0].canBeWrapped()).to.equal(true);
  });

  it('should include correct overload for constructor', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapConstructor('Standard_Real, Standard_Real, Standard_Real');
      });
    });
    var def = configurator.createModel(conf).getMember('test');
    var pnt = def.getMember('Pnt');
    expect(pnt.getMember('New').overloads[0].declType).to.equal('constructorOverload');
  });
  it('should sort classes by inheritance', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint');
      mod.wrapClass('Geom_Direction', 'Direction');
      mod.wrapClass('Geom_Vector', 'Vector');
      mod.wrapClass('Geom_Geometry', 'Geometry');
      mod.wrapClass('Geom_Point', 'Point');
    });
    var mod = configurator.createModel(conf).getMember('test');
    expect(mod.members[0].name).to.equal('Geometry');
    expect(mod.members[1].name).to.equal('Point');
    expect(mod.members[2].name).to.equal('Vector');
    expect(mod.members[3].name).to.equal('CartesianPoint');
    expect(mod.members[4].name).to.equal('Direction');
  });

  it('can define methods with out args and return them', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
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
    });
    var mod = configurator.createModel(conf).getMember('test');
    var curve = mod.getMember('Curve');
    var d0 = curve.getMember('d0');
    var d1 = curve.getMember('d1');
    expect(d0.overloads[0].getOutputArguments().length).to.equal(1);
    expect(d1.overloads[0].getOutputArguments().length).to.equal(2);
    expect(d0.overloads[0].getInputArguments().length).to.equal(1);
    expect(d1.overloads[0].getInputArguments().length).to.equal(1);
  });

  it('can figure out module dependencies', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'gp';
      mod.wrapClass('gp_Vec', 'Vec');
      mod.wrapClass('gp_Dir', 'Dir');
      mod.wrapClass('gp_Pln', 'Pln');
      mod.wrapClass('gp_Pnt', 'Pnt');
    }, (mod) => {
      mod.name = 'Geom';
      mod.wrapClass('Geom_Point', 'Point', (cls) => {
        cls.wrapMethod('Distance', 'distance');
      });
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint', (cls) => {
        cls.wrapConstructor('*');
      });
      mod.wrapClass('Geom_Plane', 'Plane', (cls) => {
        cls.wrapConstructor('*');
      });
    });
    var wrapper = configurator.createModel(conf);
    var modGeom = wrapper.getMember('Geom');
    expect(modGeom.getDependencies().map(dep => dep.name)).to.include('gp');
    expect(modGeom.getDependencies().map(dep => dep.name)).to.not.include('Geom');
  });

  it('can wrap properties with wrapped values', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapClass('gp_Dir', 'Dir');
      mod.wrapClass('gp_Ax1', 'Ax1', (cls) => {
        cls.wrapConstructor('*')
          .wrapProperty('Direction', 'SetDirection', 'direction')
          .wrapProperty('Location', 'SetLocation', 'location');
      });
    });
    var mod = configurator.createModel(conf).getMember('test');
    var ax1 = mod.getMember('Ax1');
    console.log(ax1.getMember('direction').overloads);
    expect(ax1.getMember('direction').canBeWrapped()).to.equal(true);
    expect(ax1.getMember('direction').overloads.every(overload => overload.canBeWrapped())).to.equal(true);
  })

  it('can get inherited wrapped members', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapClass('Geom_Geometry', 'Geometry', (cls) => {
        cls.wrapMethod('Mirrored', 'mirrored');
      });
      mod.wrapClass('Geom_Curve', 'Curve', (cls) => {
        cls.wrapMethod('Reverse', 'reverse');
      });
      mod.wrapClass('Geom_Line', 'Line', (cls) => {
        cls.wrapMethod('Reverse', 'reverse');
        cls.wrapMethod('FirstParameter', 'firstParameter');
      });
    });
    var mod = configurator.createModel(conf).getMember('test');
    var curve = mod.getMember('Curve');
    var line = mod.getMember('Line');

    expect(curve.getAllMembers().map(mem => mem.name)).to.include('mirrored');
    expect(line.getAllMembers().map(mem => mem.name)).to.include('mirrored');
    console.log(line.getAllMembers().map(mem => mem.name))
    expect(line.getAllMembers().map(mem => mem.name)).to.include('reverse');
    expect(line.getAllMembers().filter(mem => mem.name === 'reverse').length).to.equal(1);
    expect(line.getAllMembers().map(mem => mem.name)).to.include('firstParameter');
    expect(line.getInheritedMembers().map(mem => mem.name)).to.include('mirrored');
    expect(line.getInheritedMembers().map(mem => mem.name)).to.include('reverse');
    expect(line.getInheritedMembers().map(mem => mem.name)).to.not.include('firstParameter');
  });

  it('can can find all permutations of concrete arguments for abstract arguments', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('Geom_Geometry', 'Geometry');
      mod.wrapClass('Geom_Curve', 'Curve');
      mod.wrapClass('Geom_OffsetCurve', 'OffsetCurve', (cls) => {
        cls.wrapMethod('SetBasisCurve', 'setBasisCurve');
      });
      mod.wrapClass('Geom_Line', 'Line');
      mod.wrapClass('Geom_BoundedCurve', 'BoundedCurve');
      mod.wrapClass('Geom_BezierCurve', 'BezierCurve');
      mod.wrapClass('Geom_Point', 'Point', (cls) => {
        cls.wrapMethod('Distance', 'distance');
      });
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint');
    });
    var mod = configurator.createModel(conf).getMember('test');
    var distanceFunc = mod.getMember('Point').getMember('distance').overloads[0];
    var distAlts = distanceFunc.getAbstractArgumentAlternatives();

    expect(distAlts.length).to.equal(1);
    expect(distAlts[0].map(arg => arg.type)).to.include('Geom_CartesianPoint');

    var setBasisFunc = mod.getMember('OffsetCurve').getMember('setBasisCurve').overloads[0];
    var basisAlts = setBasisFunc.getAbstractArgumentAlternatives();
    var firstArgs = basisAlts.map(alt => alt[0].type);
    expect(basisAlts.length).to.equal(3);
    expect(firstArgs).to.include('Geom_Line');
    expect(firstArgs).to.include('Geom_BezierCurve');
    expect(firstArgs).to.include('Geom_OffsetCurve');
  });


  it('can can define collection classes', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapClass('Geom_BezierCurve', 'BezierCurve', (cls) => {
        cls.wrapConstructor('*');
        cls.wrapMethod('Poles', 'poles');
        cls.wrapMethod('Weights', 'weights');
      });
      mod.wrapCollection('TColgp_Array1OfPnt', 'Array1OfPnt', 'Array1', 'Pnt');
      mod.wrapCollection('TColStd_Array1OfReal', 'Array1OfReal', 'Array1', 'double');
    });
    var mod = configurator.createModel(conf).getMember('test');
    expect(mod.getMember('Array1OfPnt')).not.to.equal(undefined);
    expect(mod.getMember('Array1OfReal')).not.to.equal(undefined);
    var bezier = mod.getMember('BezierCurve');

    expect(bezier.getMember('poles').canBeWrapped()).to.equal(true);
    expect(bezier.getMember('weights').canBeWrapped()).to.equal(true);
    expect(bezier.getConstructor()
      .overloads.every(overload => overload.canBeWrapped())).to.equal(true);
  });

  it('can define builder methods', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt');
      mod.wrapClass('gp_Dir', 'Dir');
      mod.wrapClass('gp_Ax1', 'Ax1');
      mod.wrapClass('Geom_Line', 'Line', (cls) => {
        cls.wrapBuilder('GC_MakeLine', 'line', { name: 'value', method: 'Value' });
      });
    });
    var mod = configurator.createModel(conf).getMember('test');
    var lineCls = mod.getMember('Line');
    var line = lineCls.getMember('line');
    expect(line.overloads.length).to.equal(5);
    expect(line.resultGetters.length).to.equal(1);
    expect(line.canBeWrapped()).to.equal(true);
  });
});
