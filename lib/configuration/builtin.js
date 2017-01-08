const ConfigurationBase = require('./base.js');

class BuiltinConfiguration extends ConfigurationBase {
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

module.exports = BuiltinConfiguration;
