const DeclarationConfiguration = require('./declaration.js').configuration;
const DeclarationDefinition = require('./declaration.js').definition;
const definitions = require('./definitions.js');
const nativeAPI = require('../nativeAPI');

class MethodOverloadConfiguration {
  constructor(methodKey) {
    this.methodKey = methodKey;
  }
}

class MethodOverloadDefinition {
  constructor(wrapperAPI, conf) {
    this.methodKey = conf.methodKey;
    this.nativeMethod = nativeAPI.get(this.methodKey);
    this.wrapperAPI = wrapperAPI;
  }


}

class MethodDefinition extends DeclarationDefinition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
    this.overloads = conf.overloads.map(
      overload => new MethodOverloadDefinition(wrapperAPI, overload)
    );
    this.declType = conf.declType;
    this.cppName = this.overloads[0].nativeMethod.name;
  }

  getKeys() {
    return [this.methodKey];
  }
}

definitions.register('method', MethodDefinition);


class MethodConfiguration extends DeclarationConfiguration {
  constructor(parent, name, methodKey) {
    super(parent, name);
    this.overloads = [new MethodOverloadConfiguration(methodKey)];
    this.declType = 'method';
  }

  overload(methodKey) {
    this.overloads.push(new MethodOverloadConfiguration(methodKey));
  }

  getKeys() {
    return [this.overloads.map(overload => overload.methodKey)];
  }
}

module.exports = {
  configuration: MethodConfiguration,
  definition: MethodDefinition
};
