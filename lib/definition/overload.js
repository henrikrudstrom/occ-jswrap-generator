const nativeAPI = require('../nativeAPI');
const DefinitionBase = require('./base.js');
const clone = require('clone');
const extend = require('extend');
const combinatorics = require('js-combinatorics');


class MethodOverloadDefinition extends DefinitionBase {
  constructor(conf, factory, typemap, parent) {
    super(conf, factory, typemap, parent);
    this.methodKey = conf.methodKey;
    this.nativeMethod = nativeAPI.get(this.methodKey);
    this.returnType = this.nativeMethod.return.type;
    this.arguments = conf.arguments;
  }

  getAlternativesForArg(arg) {
    var wrappedType = this.typemap.getWrappedType(arg.type);
    if (!wrappedType.isAbstract) return [arg];
    return this.typemap.getInheritedTypes(arg.type)
      .filter(iarg => !this.typemap.getWrappedType(iarg).isAbstract)
      .map(iarg => (extend(clone(arg), { type: iarg })));
  }

  getAbstractArgumentAlternatives() {
    var combinations = this.getInputArguments()
      .map(arg => this.getAlternativesForArg(arg));
    return combinatorics.cartesianProduct(...combinations).toArray();
  }

  getInputArguments() {
    return this.arguments.filter(arg => !arg.out);
  }

  getOutputArguments() {
    return this.arguments.filter(arg => arg.out);
  }

  getWrappedDependencies() {
    if (!this.wrappedDependenciesCache) {
      this.wrappedDependenciesCache = this.nativeMethod.arguments
        .map(arg => arg.type)
        .concat(this.nativeMethod.return.type ? [this.nativeMethod.return.type] : [])
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
  constructor(conf, factory, typemap, parent) {
    super(conf, factory, typemap, parent);
    this.methodKey = conf.methodKey;
    this.nativeMethod = nativeAPI.get(this.methodKey);
    this.returnType = parent.parent.nativeName;
  }
}
ConstructorOverloadDefinition.prototype.declType = 'constructorOverload';

class GetterOverloadDefinition extends MethodOverloadDefinition {}
GetterOverloadDefinition.prototype.declType = 'getterOverload';

class SetterOverloadDefinition extends MethodOverloadDefinition {}
SetterOverloadDefinition.prototype.declType = 'setterOverload';


module.exports = {
  MethodOverloadDefinition,
  ConstructorOverloadDefinition,
  GetterOverloadDefinition,
  SetterOverloadDefinition
};
