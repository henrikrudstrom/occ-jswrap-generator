var expect = require('chai').expect;
const configure = require('../src/configure.js');
const util = require('../src/util.js');

describe('Wrapper configuration', () => {
  it('can define specific classes to be wrapped', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pnt', 'Pnt');
      expect(cls.name).to.equal('Pnt');
      expect(mod.declarations.length).to.equal(1);
      expect(mod.getMemberByKey('gp_Pnt')).to.not.equal(undefined);
      expect(mod.getMemberByName('Pnt')).to.not.equal(undefined);
    });
  });

  it('can define many wrapped classes with a naming function', () => {
    configure((mod) => {
      mod.wrapClasses('gp_*', util.renameClass);
      expect(mod.getMemberByKey('gp_Pnt').name).to.equal('Pnt');
      expect(mod.declarations.length).to.equal(41);
    });
  });

  it('can exclude or override already wrapped classes', () => {
    configure((mod) => {
      mod.wrapClasses('gp_*', util.renameClass);
      mod.excludeByKey('gp_XYZ');
      expect(mod.declarations.length).to.equal(40);
      expect(mod.getMemberByKey('gp_XYZ')).to.equal(undefined);
    });
  });

  it('can override already wrapped classes', () => {
    configure((mod) => {
      mod.wrapClasses('gp_*', util.renameClass);
      mod.rename('Pnt', 'Point');
      expect(mod.declarations.length).to.equal(41);
      expect(mod.getMemberByKey('gp_Pnt').name).to.equal('Point');
    });
  });

  it('can define methods to be wrapped', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pnt', 'Point')
        .wrapMethod('Distance', 'distance')
        .wrapMethod('X', 'x');

      expect(cls.declarations.length).to.equal(2);
      expect(cls.declarations[0].name).to.equal('distance');
    });
  });

  it('can define many wrapped methods at once', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pnt', 'Point')
        .wrapMethod('Set*', util.renameMember);
      expect(cls.declarations.length).to.equal(5);
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
      expect(cls.declarations.length).to.equal(5);
    });
  });

  it('can exclude wrapped methods', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pnt', 'Point')
        .wrapMethod('Set*', util.renameMember)
        .excludeByName('setX');
      expect(cls.declarations.length).to.equal(4);
      expect(cls.getMemberByName('setX')).to.equal(undefined);
    });
  });

  it('can define overloaded methods', () => {
    configure((mod) => {
      var cls = mod.wrapClass('gp_Pln', 'Plane')
        .wrapMethod('Distance', 'distance');
      expect(cls.declarations.length).to.equal(1);
      expect(cls.declarations[0].overloads.length).to.equal(3);
    });
  });

  it('can distinguish if a class is derived from Standard_Transient or not', () => {
    configure((mod) => {
      var pln = mod.wrapClass('gp_Pln', 'Pln');
      expect(pln.hasHandle).to.equal(false);
      var plane = mod.wrapClass('Geom_Plane', 'Plane');
      expect(plane.hasHandle).to.equal(true);
    });
  });

  it('can define wrapped properties', () => {
    configure((mod) => {
      var pnt = mod.wrapClass('gp_Pnt', 'Pnt')
        .wrapProperty('X', 'SetX', 'x');
      expect(pnt.getMemberByName('x').declType).to.equal('property');
    });
  });

  it('can define wrapped properties', () => {
    configure((mod) => {
      var pnt = mod.wrapClass('gp_Pnt', 'Pnt')
        .wrapMethod('*', util.renameMember)
        .wrapProperty('X', 'SetX', 'x');
      expect(pnt.declarations.length).to.equal(25);
      expect(pnt.getMemberByName('x').declType).to.equal('property');
      expect(pnt.getMemberByName('setX')).to.equal(undefined);

    });
  });
});
