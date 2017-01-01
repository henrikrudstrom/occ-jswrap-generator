
class DeclarationDefinition {
  constructor(wrapperAPI, parent, def) {
    this.wrapperAPI = wrapperAPI;
    this.parent = parent;
    this.name = def.name;
  }
}

class DeclarationConfiguration {
  constructor(parent, name) {
    this.parent = parent;
    this.name = name;
  }
}

module.exports = {
  configuration: DeclarationConfiguration,
  definition: DeclarationDefinition
};
