const ConfigurationBase = require('./base.js');

class MethodOverloadConfiguration extends ConfigurationBase {
  constructor(name, methodKey, type) {
    super(name);
    this.methodKey = methodKey;
    this.type = type || 'methodOverload';
  }
}

module.exports = MethodOverloadConfiguration;
