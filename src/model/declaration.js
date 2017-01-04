class DeclarationDefinition {
  constructor(wrapperAPI, parent, def) {
    this.wrapperAPI = wrapperAPI;
    this.parent = parent;
    this.name = def.name;
    this.declType = def.declType;
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
