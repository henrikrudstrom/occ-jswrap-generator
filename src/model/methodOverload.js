const nativeAPI = require('../nativeAPI');
const Declaration = require('./declaration.js');
const factory = require('../factory.js');

class MethodOverloadConfiguration extends Declaration.Configuration {
  constructor(name, methodKey) {
    super(name, 'methodOverload');
    this.methodKey = methodKey;
  }
}

class MethodOverloadDefinition extends Declaration.Definition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
    this.methodKey = conf.methodKey;
    this.nativeMethod = nativeAPI.get(this.methodKey);
    if (this.nativeMethod === undefined) throw new Error('Could not find native method ' + this.methodKey);
    this.wrapperAPI = wrapperAPI;
  }

  getWrappedDependencies() {
    if (!this.wrappedDependenciesCache) {
      this.wrappedDependenciesCache = this.nativeMethod.arguments
        .map(arg => arg.type)
        .concat(this.nativeMethod.returnType ? [this.nativeMethod.returnType] : [])
        .filter(type => !this.wrapperAPI.isBuiltIn(type))
        .filter(type => type !== 'void')
        .map(type => this.wrapperAPI.getWrappedType(type));
    }
    return this.wrappedDependenciesCache;
  }

  canBeWrapped() {
    return this.getWrappedDependencies().every(dep => Boolean(dep));
  }
}

factory.registerDefinition('methodOverload', MethodOverloadDefinition);

module.exports = {
  Configuration: MethodOverloadConfiguration,
  Definition: MethodOverloadDefinition
};
