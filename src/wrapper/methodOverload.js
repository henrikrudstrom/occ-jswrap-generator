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
    if (!this.wrappedDependenciesCache) {
      this.wrappedDependenciesCache = this.nativeMethod.arguments
        .map(arg => arg.type)
        .concat(this.nativeMethod.returnType === '' ? [this.nativeMethod.returnType] : [])
        .map(type => this.wrapperAPI.getWrappedType(type))
        .filter(t => t !== 'double' && t !== 'bool' && t !== 'int32_t');
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
