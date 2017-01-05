var Typemap = require('./typemap.js');

class Factory {
  constructor(constructors) {
    this.constructors = {};
    constructors.forEach((ctor) => {
      this.constructors[ctor.prototype.type] = ctor;
    });
  }
}

class RendererFactory extends Factory {
  create(def, typemap) {
    typemap = typemap || new Typemap.Renderer();
    var renderer = new this.constructors[def.type](def, this, typemap);
    typemap.populate(renderer);
    return renderer;
  }
}

class DefinitionFactory extends Factory {
  create(def, parent, typemap) {
    typemap = typemap || new Typemap.Definition();
    var renderer = new this.constructors[def.type](def, parent, this, typemap);
    typemap.populate(renderer);
    return renderer;
  }
}

module.exports = {
  Definition: DefinitionFactory,
  Renderer: RendererFactory
};
