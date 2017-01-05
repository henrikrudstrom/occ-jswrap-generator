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

module.exports = {
  Definition: DefinitionFactory,
  Renderer: RendererFactory
};
