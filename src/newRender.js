const RendererTypemap = require('./typemap.js').RendererTypemap;

class Factory {
  constructor(constructors) {
    this.constructors = {};
    constructors.forEach((ctor) => {
      this.constructors[ctor.factoryKey()] = ctor;
    });
  }
}

class RendererFactory extends Factory {
  create(def, typemap) {
    var renderer = new this.constructors[def.declType](def, this, typemap);
    typemap.populate(renderer);
  }
}

class DefinitionFactory extends Factory {
  create(def, parent, typemap) {
    var renderer = new this.constructors[def.declType](def, parent, this, typemap);
    typemap.populate(renderer);
  }
}

module.exports = function render(model, renderers) {
  var typemap = new RendererTypemap();
  var factory = new RendererFactory(renderers);
  var root = factory.create(model, typemap);

  var files = {};
  root.renderMain(files);
  return files;
};
