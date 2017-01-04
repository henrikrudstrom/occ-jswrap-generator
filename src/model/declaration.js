class DeclarationDefinition {
  constructor(wrapperAPI, parent, def) {
    this.wrapperAPI = wrapperAPI;
    this.parent = parent;
    this.name = def.name;
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
