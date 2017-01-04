const nativeAPI = require('../nativeAPI');


class MethodOverloadConfiguration {
  constructor(methodKey) {
    this.methodKey = methodKey;
    this.declType = 'methodOverload';
  }
}

class MethodOverloadDefinition {
  constructor(wrapperAPI, conf) {
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

module.exports = {
  Configuration: MethodOverloadConfiguration,
  Definition: MethodOverloadDefinition
};
