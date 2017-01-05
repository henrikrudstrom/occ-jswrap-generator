const nativeAPI = require('../nativeAPI');
const Declaration = require('./declaration.js');

class MethodOverloadDefinition extends Declaration.Definition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.methodKey = conf.methodKey;
    this.nativeMethod = nativeAPI.get(this.methodKey);
    if (this.nativeMethod === undefined) throw new Error('Could not find native method ' + this.methodKey);
    this.typemap = typemap;
  }


  getWrappedDependencies() {
    if (!this.wrappedDependenciesCache) {
      this.wrappedDependenciesCache = this.nativeMethod.arguments
        .map(arg => arg.type)
        .concat(this.nativeMethod.returnType ? [this.nativeMethod.returnType] : [])
        .filter(type => !this.typemap.isBuiltIn(type))
        .filter(type => type !== 'void')
        .map(type => this.typemap.getWrappedType(type));
    }
    return this.wrappedDependenciesCache;
  }

  canBeWrapped() {
    return this.getWrappedDependencies().every(dep => Boolean(dep));
  }
}
MethodOverloadDefinition.prototype.type = 'methodOverload';

class MethodOverloadConfiguration extends Declaration.Configuration {
  constructor(name, methodKey) {
    super(name);
    this.methodKey = methodKey;
  }
}
MethodOverloadConfiguration.prototype.type = 'methodOverload';


module.exports = {
  Configuration: MethodOverloadConfiguration,
  Definition: MethodOverloadDefinition
};
