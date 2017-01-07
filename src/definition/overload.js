const nativeAPI = require('../nativeAPI');
const DeclarationDefinition = require('./declaration.js');

class MethodOverloadDefinition extends DeclarationDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.methodKey = conf.methodKey;
    this.nativeMethod = nativeAPI.get(this.methodKey);
    this.returnType = this.nativeMethod.returnType;
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

class ConstructorOverloadDefinition extends MethodOverloadDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.methodKey = conf.methodKey;
    this.nativeMethod = nativeAPI.get(this.methodKey);
    this.returnType = parent.parent.name;
  }
}
ConstructorOverloadDefinition.prototype.type = 'constructorOverload';

class GetterOverloadDefinition extends MethodOverloadDefinition {
}
GetterOverloadDefinition.prototype.type = 'getterOverload';

class SetterOverloadDefinition extends MethodOverloadDefinition {
}
SetterOverloadDefinition.prototype.type = 'setterOverload';


module.exports = {
  MethodOverloadDefinition,
  ConstructorOverloadDefinition,
  GetterOverloadDefinition,
  SetterOverloadDefinition
};
