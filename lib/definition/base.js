class DefinitionBase {
  constructor(conf, factory, typemap, parent) {
    this.typemap = typemap;
    this.parent = parent;
    this.name = conf.name;
  }

  canBeWrapped() {
    return true;
  }
}

module.exports = DefinitionBase;
