var Typemap = require('./typemap.js');

class Factory {
  constructor(constructors) {
    this.constructors = {};
    constructors.forEach((ctor) => {
      this.constructors[ctor.prototype.declType] = ctor;
    });
  }
}

class RendererFactory extends Factory {
  create(def, typemap, ...rest) {
    typemap = typemap || new Typemap.Renderer();
    var renderer = new this.constructors[def.declType](def, this, typemap, ...rest);
    typemap.populate(renderer);
    return renderer;
  }
}

class DefinitionFactory extends Factory {
  create(def, parent, typemap, ...rest) {
    typemap = typemap || new Typemap.Definition();
    var renderer = new this.constructors[def.declType](def, parent, this, typemap, ...rest);
    typemap.populate(renderer);
    return renderer;
  }
}

module.exports = {
  Definition: DefinitionFactory,
  Renderer: RendererFactory
};
