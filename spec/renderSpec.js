const chai = require('chai');
const configure = require('../src/configure.js');
const util = require('../src/util.js');
const dummyRenderers = require('./renderers/dummy.js');
const render = require('../src/newRender.js');

const expect = chai.expect;
chai.use(require('chai-things'));

describe('Wrapper definition', () => {
  it('it can render', () => {
    var wrapper = configure((mod) => {
      mod.name = 'mod_a';
      mod.wrapClass('Geom_Plane', 'Point')
        .wrapMethod('UReverse', 'uReverse')
        .wrapMethod('VReverse', 'vReverse');
      mod.wrapClass('Geom_Geometry', 'Geometry')
        .wrapMethod('Mirror', 'mirror');
    }, (mod) => {
      mod.name = 'mod_a';
      mod.wrapClass('gp_Pnt', 'Pnt')
        .wrapMethod('X');
    });
    var files = render(wrapper, dummyRenderers);
    expect(files['./makefile']).to.equal('dummy makefile content');
    expect(files['src/mod_a.cc']).to.equal('init {\n  Point::init()\nGeometry::init()\n}');
    expect(files['src/Point.cc']).to.equal('implementation {\n  Point::uReverse { ... }\nPoint::vReverse { ... }\n}');
    expect(files['src/Geometry.cc']).to.equal('implementation {\n  Geometry::mirror { ... }\n}');
  });
});
