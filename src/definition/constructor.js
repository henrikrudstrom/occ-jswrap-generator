const MethodDefinition = require('./method.js');
const nativeAPI = require('../nativeAPI');

class ConstructorDefinition extends MethodDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.overloads.forEach((overload) => {
      overload.type = 'constructorOverload';
      overload.returnType = parent.nativeName;
    });
  }
}
ConstructorDefinition.prototype.type = 'constructor';

module.exports = ConstructorDefinition;