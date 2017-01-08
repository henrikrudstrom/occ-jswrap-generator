const nativeAPI = require('../nativeAPI');
const DefinitionBase = require('./base.js');

class MethodOverloadDefinition extends DefinitionBase {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.methodKey = conf.methodKey;
    this.nativeMethod = nativeAPI.get(this.methodKey);
    this.returnType = this.nativeMethod.returnType;
    this.arguments = conf.arguments;
  }

  getInputArguments() {
    return this.nativeMethod.arguments
      .filter(arg => !this.argouts[arg.name]);
  }

  getOutputArguments() {
    return this.nativeMethod.arguments
      .filter(arg => this.argouts[arg.name]);
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
MethodOverloadDefinition.prototype.declType = 'methodOverload';

class ConstructorOverloadDefinition extends MethodOverloadDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.methodKey = conf.methodKey;
    this.nativeMethod = nativeAPI.get(this.methodKey);
    this.returnType = parent.parent.name;
  }
}
ConstructorOverloadDefinition.prototype.declType = 'constructorOverload';

class GetterOverloadDefinition extends MethodOverloadDefinition {
}
GetterOverloadDefinition.prototype.declType = 'getterOverload';

class SetterOverloadDefinition extends MethodOverloadDefinition {
}
SetterOverloadDefinition.prototype.declType = 'setterOverload';


module.exports = {
  MethodOverloadDefinition,
  ConstructorOverloadDefinition,
  GetterOverloadDefinition,
  SetterOverloadDefinition
};
