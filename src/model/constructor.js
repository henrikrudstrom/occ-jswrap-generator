const Method = require('./method.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js').Configuration;

class ConstructorDefinition extends Method.Definition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.overloads.forEach((overload) => {
      overload.type = 'constructorOverload';
      overload.returnType = parent.nativeName;
    });
  }
}
ConstructorDefinition.prototype.type = 'constructor';

class ConstructorConfiguration extends Method.Configuration {
  constructor(name, methodKey) {
    super(name, methodKey);
  }

  static wrap(parent, signature) {
    var ctorQuery = `${parent.nativeName}::${parent.nativeName}(${signature})`;
    var ctors = nativeAPI.find(ctorQuery, 'constructor')
      .filter(ctor => ctor.copyConstructor !== true);
    return Method.Configuration.$wrapMethod(
      parent, new ConstructorConfiguration(parent.name, ctors));
  }
}
ConstructorConfiguration.prototype.type = 'constructor';
ClassConfiguration.registerType('constructor', ConstructorConfiguration.wrap);

module.exports = {
  Configuration: ConstructorConfiguration,
  Definition: ConstructorDefinition
};
