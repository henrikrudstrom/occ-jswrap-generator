const DeclarationConfiguration = require('./declaration.js');

class MethodOverloadConfiguration extends DeclarationConfiguration {
  constructor(name, methodKey) {
    super(name);
    this.methodKey = methodKey;
  }
}
MethodOverloadConfiguration.prototype.type = 'methodOverload';


module.exports = MethodOverloadConfiguration;
