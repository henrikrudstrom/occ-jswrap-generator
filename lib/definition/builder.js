const callable = require('./callable.js');
const overload = require('./overload.js');

class BuilderDefinition extends callable.CallableDefinition {
  constructor(conf, factory, typemap, parent, parentClass) {
    super(conf, factory, typemap, parent, parentClass);
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
    this.specializedReturnType = conf.specializedReturnType;
    this.args = conf.args;
  }

}
BuilderOverloadDefinition.prototype.declType = 'builderOverload';

module.exports = { BuilderDefinition, BuilderOverloadDefinition };
