const Declaration = require('./declaration.js');
const factory = require('../factory.js');

class BuiltinDefinition extends Declaration.Definition {
}

factory.registerDefinition('builtin', BuiltinDefinition);

class BuiltinConfiguration extends Declaration.Configuration {
  constructor(name, nativeName) {
    super(name, 'builtin');
    this.nativeName = nativeName;
    this.isType = true;
    this.isBuiltIn = true;
  }

  getKeys() {
    return [this.nativeName];
  }
}

module.exports = {
  Configuration: BuiltinConfiguration,
  Definition: BuiltinDefinition
};
