const callable = require('./callable.js');
const overload = require('./overload.js');

class BuilderDefinition extends callable.CallableDefinition {
  constructor(conf, factory, typemap, parent, parentClass) {
    super(conf, factory, typemap, parent, parentClass);
    this.resultGetters = conf.resultGetters;
    this.nativeName = conf.nativeName;
    this.overloads.forEach((overload) => {
      overload.returnType = 'void';
    });
  }
}
BuilderDefinition.prototype.declType = 'builder';

class BuilderOverloadDefinition extends overload.MethodOverloadDefinition {
  constructor(conf, factory, typemap, parent) {
    super(conf, factory, typemap, parent);
    this.methodKey = conf.methodKey;
    this.returnType = this.nativeMethod.return.type;
    this.specializedReturnType = conf.specializedReturnType;
    this.arguments = conf.arguments;
  }

}
BuilderOverloadDefinition.prototype.declType = 'builderOverload';

module.exports = { BuilderDefinition, BuilderOverloadDefinition };
