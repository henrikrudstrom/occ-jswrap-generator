const Method = require('./method.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js').Configuration;

class ConstructorDefinition extends Method.Definition {

}

class ConstructorConfiguration extends Method.Configuration {
  constructor(name, methodKey) {
    super(name, methodKey);
    this.declType = 'constructor';
  }
  
  static wrap(parent, signature) {
    var ctorQuery = `${parent.nativeName}::${parent.nativeName}(${signature})`;
    var ctors = nativeAPI.find(ctorQuery, 'constructor')
      .filter(ctor => ctor.copyConstructor !== true);
    return Method.Configuration.$wrapMethod(parent, new ConstructorConfiguration(parent.name, ctors));
  }
}

ClassConfiguration.registerType('constructor', ConstructorConfiguration.wrap);

module.exports = {
  Configuration: ConstructorConfiguration,
  Definition: ConstructorDefinition
};
