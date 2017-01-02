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

  getWrappedDependencies() {
    if (!this.wrappedDependenciesCache){
      this.wrappedDependenciesCache = this.nativeMethod.arguments
        .map(arg => arg.type)
        .concat([this.nativeMethod.returnType])
        .map(type => this.wrapperAPI.getWrappedType(type))
        .filter(t => t !== 'double' && t !== 'bool' && t !== 'int32_t');
    }
    return this.wrappedDependenciesCache;
  }

  canBeWrapped() {
    return this.getWrappedDependencies().every(dep => Boolean(dep));
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

  getWrappedDependencies() {
    return this.overloads
      .filter(overload => overload.canBeWrapped())
      .map(overload => overload.getWrappedDependencies())
      .reduce((a, b) => a.concat(b), [])
      .filter((t, index, array) => array.indexOf(t) === index);
  }

  canBeWrapped() {
    return this.overloads.every(overload => overload.canBeWrapped());
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
