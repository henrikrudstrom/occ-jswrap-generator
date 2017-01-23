const nativeAPI = require('../nativeAPI');
const DefinitionBase = require('./base.js');
const clone = require('clone');
const extend = require('extend');
const combinatorics = require('js-combinatorics');


class MethodOverloadDefinition extends DefinitionBase {
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
    return this.args.filter(arg => !arg.out);
  }

  getOutputArguments() {
    return this.args.filter(arg => arg.out);
  }

  getReturnValues() {

  }

  getWrappedDependencies() {
    if (!this.wrappedDependenciesCache) {
      this.wrappedDependenciesCache = this.args
        .map(arg => arg.type)
        .concat(this.returnType ? [this.returnType] : [])
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
    this.returnType = parent.parent.nativeName;
  }
}
ConstructorOverloadDefinition.prototype.declType = 'constructorOverload';

class JSArrayConstructorOverloadDefinition extends ConstructorOverloadDefinition {}
JSArrayConstructorOverloadDefinition.prototype.declType = 'jsArrayConstructorOverload';

class GetterOverloadDefinition extends MethodOverloadDefinition {}
GetterOverloadDefinition.prototype.declType = 'getterOverload';

class SetterOverloadDefinition extends MethodOverloadDefinition {}
SetterOverloadDefinition.prototype.declType = 'setterOverload';

class IndexedGetterOverloadDefinition extends MethodOverloadDefinition {}
IndexedGetterOverloadDefinition.prototype.declType = 'indexedGetterOverload';

class IndexedSetterOverloadDefinition extends MethodOverloadDefinition {}
IndexedSetterOverloadDefinition.prototype.declType = 'indexedSetterOverload';

module.exports = {
  MethodOverloadDefinition,
  ConstructorOverloadDefinition,
  GetterOverloadDefinition,
  SetterOverloadDefinition,
  IndexedGetterOverloadDefinition,
  IndexedSetterOverloadDefinition,
  JSArrayConstructorOverloadDefinition
};
