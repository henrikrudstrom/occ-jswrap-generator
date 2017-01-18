const ConfigurationBase = require('./base.js');

class BuiltinConfiguration extends ConfigurationBase {
  constructor(name, jsname, nativeName) {
    super(name);
    this.jsname = jsname;
    this.nativeName = nativeName;
    this.isType = true;
    this.isBuiltIn = true;
  }
}
BuiltinConfiguration.prototype.declType = 'builtin';

module.exports = BuiltinConfiguration;
