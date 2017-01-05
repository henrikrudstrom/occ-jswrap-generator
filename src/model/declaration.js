class DeclarationDefinition {
  constructor(conf, parent, factory, typemap) {
    this.typemap = typemap;
    this.parent = parent;
    this.name = conf.name;
    this.declType = conf.declType;
  }
}

class DeclarationConfiguration {
  constructor(name, declType) {
    if (name === undefined) throw new Error('Declaration name cannot be undefined');
    this.name = name;
    if (declType === undefined) throw new Error('Declaration type cannot be undefined');
    this.declType = declType;
  }
}

module.exports = {
  Configuration: DeclarationConfiguration,
  Definition: DeclarationDefinition
};
