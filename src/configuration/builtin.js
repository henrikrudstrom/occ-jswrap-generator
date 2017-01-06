const DeclarationConfiguration = require('./declaration.js');

class BuiltinConfiguration extends DeclarationConfiguration {
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
