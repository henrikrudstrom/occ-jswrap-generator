const Declaration = require('./declaration.js');

class BuiltinDefinition extends Declaration.Definition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.nativeName = conf.nativeName;
    this.isType = true;
    this.isBuiltIn = true;
  }
}
BuiltinDefinition.prototype.type = 'builtin';

class BuiltinConfiguration extends Declaration.Configuration {
  constructor(name, nativeName) {
    super(name);
    this.nativeName = nativeName;
    this.isType = true;
    this.isBuiltIn = true;
  }

  getKeys() {
    return [this.nativeName];
  }
}
BuiltinConfiguration.prototype.type = 'builtin';

module.exports = {
  Configuration: BuiltinConfiguration,
  Definition: BuiltinDefinition
};
