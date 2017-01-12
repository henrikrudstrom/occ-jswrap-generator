const chai = require('chai');
const configurator = require('../lib/configurator.js');
var Factory = require('../lib/factory.js').Definition;
var definitions = require('../lib/definition');

const expect = chai.expect;
chai.use(require('chai-things'));

describe('typemap', () => {
  it('can recognize builtin types', () => {
    var conf = configurator.configure(() => {});
    var wrapper = configurator.createModel(conf);
    var typemap = wrapper.typemap;

    expect(typemap.wrapped).to.include.keys('Standard_Real');
    expect(typemap.types).to.include.keys('Number');
    expect(typemap.getWrappedType('Standard_Real').name).to.equal('Number');
  });

  it('can figure out mappings', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_Geometry', 'Geometry');
      mod.wrapClass('gp_Pnt', 'Pnt');
    });

    var wrapper = configurator.createModel(conf);
    var typemap = wrapper.typemap;

    expect(typemap.getWrappedType('Geom_Point').name).to.equal('Point');
    expect(typemap.getWrappedType('gp_Pnt').name).to.equal('Pnt');
    expect(typemap.isBuiltIn('Standard_Real')).to.equal(true);
    expect(typemap.isBuiltIn('gp_Pnt')).to.equal(false);
    expect(typemap.getWrappedType('Standard_Real').name).to.equal('Number');
  });

  it('can resolve handle<> types', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_Geometry', 'Geometry');
      mod.wrapClass('gp_Pnt', 'Pnt');
    });
    var wrapper = configurator.createModel(conf);
    var typemap = wrapper.typemap;
    expect(typemap.getWrappedType('opencascade::handle<Geom_Point>').name).to.equal('Point');
  });

  it('can find inherited classes', () => {
    var conf = configurator.configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('Geom_Geometry', 'Geometry');
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint');
    });
    var wrapper = configurator.createModel(conf);
    var typemap = wrapper.typemap;

    expect(typemap.getInheritedTypes('Geom_Point')).to.include('Geom_CartesianPoint');
    expect(typemap.getInheritedTypes('opencascade::handle<Geom_Point>')).to.include('Geom_CartesianPoint');
    expect(typemap.getInheritedTypes('Geom_Geometry')).to.include('Geom_Point');
    expect(typemap.getInheritedTypes('Geom_Geometry')).to.include('Geom_CartesianPoint');
    expect(typemap.getInheritedTypes('Geom_Geometry').length).to.equal(2);
  })
});
