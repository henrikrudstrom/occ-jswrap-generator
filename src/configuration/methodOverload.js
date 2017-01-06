const DeclarationConfiguration = require('./declaration.js');

class MethodOverloadConfiguration extends DeclarationConfiguration {
  constructor(name, methodKey, type) {
    super(name);
    this.methodKey = methodKey;
    this.type = type || 'methodOverload';
  }
}

module.exports = MethodOverloadConfiguration;
