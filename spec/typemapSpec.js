const chai = require('chai');
const configure = require('../src/configure.js');
var Factory = require('../src/factory.js').Definition;
var definitions = require('../src/model');

const expect = chai.expect;
chai.use(require('chai-things'));

describe('typemap', () => {
  it('can recognize builtin types', () => {
    var conf = configure(() => {});
    var wrapper = new Factory(definitions).create(conf);
    var typemap = wrapper.typemap;

    expect(typemap.wrapped).to.include.keys('Standard_Real');
    expect(typemap.types).to.include.keys('double');
    expect(typemap.getWrappedType('Standard_Real').name).to.equal('double');
  });

  it('can figure out mappings', () => {
    var conf = configure((mod) => {
      mod.name = 'moduleA';
      mod.wrapClass('Geom_Point', 'Point');
      mod.wrapClass('Geom_Geometry', 'Geometry');
      mod.wrapClass('gp_Pnt', 'Pnt');
    });

    var typemap = new Factory(definitions).create(conf).typemap;

    expect(typemap.getWrappedType('Geom_Point').name).to.equal('Point');
    expect(typemap.getWrappedType('gp_Pnt').name).to.equal('Pnt');
    expect(typemap.isBuiltIn('Standard_Real')).to.equal(true);
    expect(typemap.isBuiltIn('gp_Pnt')).to.equal(false);
    expect(typemap.getWrappedType('Standard_Real').name).to.equal('double');
  });
});