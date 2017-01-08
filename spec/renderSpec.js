const chai = require('chai');
const configure = require('../lib/configure.js');
const dummyRenderers = require('./renderers/dummy.js');
const render = require('../lib/render.js');
const definitions = require('../lib/definition');
const factory = require('../lib/factory.js');
const renderers = require('../lib/renderers/jswrapper');


const expect = chai.expect;
chai.use(require('chai-things'));

describe('Renderer', () => {
  it('it can render', () => {
    var conf = configure((mod) => {
      mod.name = 'mod_a';
      mod.wrapClass('Geom_CartesianPoint', 'Point', (cls) => {
        cls.wrapMethod('SetX', 'setX')
          .wrapConstructor('Standard_Real, Standard_Real, Standard_Real');
      });
      mod.wrapClass('Geom_Geometry', 'Geometry', (cls) => {
        cls.wrapMethod('Mirror', 'mirror');
      });
    }, (mod) => {
      mod.name = 'mod_b';
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapMethod('X', 'x');
      });
    });
    var wrapper = new factory.Definition(definitions.all).create(conf);
    var method = wrapper.getMember('mod_b').getMember('Pnt');
    expect(method.canBeWrapped()).to.equal(true);
    var files = render(wrapper, dummyRenderers);
    expect(files['./makefile']).to.equal('dummy makefile content');
    expect(files['src/mod_a.cc']).to.equal('init {\n  Geometry::init()\nPoint::init()\n}');
    expect(files['src/Point.cc']).to.equal('implementation {\n  Point::Constructor { constructorCall }\nPoint::setX { methodCall }\n}');
    expect(files['src/Geometry.cc']).to.equal('implementation {\n  Geometry::Constructor {  }\nGeometry::mirror { methodCall }\n}');
  });

  it('creates the correct renderers for a configuration', () => {
    var conf = configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
        cls.wrapMethod('Distance', 'distance')
          .wrapProperty('X', 'SetX', 'x')
          .wrapConstructor('Standard_Real, Standard_Real, Standard_Real');
      });
    });

    var model = new factory.Definition(definitions.all).create(conf);
    var wrapper = new factory.Renderer(renderers.all).create(model);
    var mod = wrapper.getMember('test');
    var cls = mod.getMember('Pnt');
    var ctor = cls.getMember('Pnt');
    var getter = cls.getMember('x');
    var method = cls.getMember('distance');
    var setter = cls.getMember('setX');

    expect(wrapper.declType).to.equal('wrapper');
    expect(mod.declType).to.equal('module');
    expect(cls.declType).to.equal('class');
    expect(method.declType).to.equal('method');
    expect(ctor.declType).to.equal('constructor');
    expect(setter.declType).to.equal('setter');
    expect(getter.declType).to.equal('getter');
    expect(method.renderers[0].declType).to.equal('methodOverload');
    expect(ctor.renderers[0].declType).to.equal('constructorOverload');
    expect(setter.renderers[0].declType).to.equal('setterOverload');
    expect(getter.renderers[0].declType).to.equal('getterOverload');
  });
  it('creates the correct renderers for abstract classes', () => {
    var conf = configure((mod) => {
      mod.name = 'test';
      mod.wrapClass('Geom_Point', 'Point', (cls) => {
        cls.wrapMethod('Distance', 'distance')
          .wrapReadOnlyProperty('X', 'x');
      });
      mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint');
    });

    var model = new factory.Definition(definitions.all).create(conf);
    var wrapper = new factory.Renderer(renderers.all).create(model);
    var mod = wrapper.getMember('test');
    var cls = mod.getMember('Point');
    var ctor = cls.getMember('Point');
    var getter = cls.getMember('x');
    var method = cls.getMember('distance');

    expect(wrapper.declType).to.equal('wrapper');
    expect(mod.declType).to.equal('module');
    expect(cls.declType).to.equal('class');
    expect(method.declType).to.equal('method');
    expect(ctor.declType).to.equal('constructor');
    expect(getter.declType).to.equal('getter');
    expect(method.renderers[0].declType).to.equal('methodOverload');
    expect(getter.renderers[0].declType).to.equal('getterOverload');
    expect(ctor.renderers.length).to.equal(0);
  });
});
