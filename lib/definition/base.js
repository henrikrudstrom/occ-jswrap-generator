class DefinitionBase {
  constructor(conf, parent, factory, typemap) {
    this.typemap = typemap;
    this.parent = parent;
    this.name = conf.name;
  }

  canBeWrapped() {
    return true;
  }
}

module.exports = DefinitionBase;
