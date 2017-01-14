class DefinitionBase {
  constructor(conf, factory, typemap, parent) {
    this.typemap = typemap;
    this.parent = parent;
    this.name = conf.name;
    this.jsname = conf.name;
  }

  canBeWrapped() {
    return true;
  }
}

module.exports = DefinitionBase;
