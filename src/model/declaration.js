class DeclarationDefinition {
  constructor(conf, parent, factory, typemap) {
    this.typemap = typemap;
    this.parent = parent;
    this.name = conf.name;
  }

  canBeWrapped() {
    return true;
  }
}

class DeclarationConfiguration {
  constructor(name) {
    if (name === undefined) throw new Error('Declaration name cannot be undefined');
    this.name = name;
  }
}

module.exports = {
  Configuration: DeclarationConfiguration,
  Definition: DeclarationDefinition
};
