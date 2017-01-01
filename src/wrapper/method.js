const DeclarationConfiguration = require('./declaration.js').configuration;
const DeclarationDefinition = require('./declaration.js').definition;
const definitions = require('./definitions.js');

class MethodDefinition extends DeclarationDefinition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
    this.methodKey = conf.methodKey;
    this.declType = conf.declType;
  }

  getKeys() {
    return [this.methodKey];
  }
}

definitions.register('method', MethodDefinition);

class MethodConfiguration extends DeclarationConfiguration {
  constructor(parent, name, methodKey) {
    super(parent, name);
    this.methodKey = methodKey;
    this.declType = 'method';
  }
  getKeys() {
    return [this.methodKey];
  }
}

module.exports = {
  configuration: MethodConfiguration,
  definition: MethodDefinition
};
