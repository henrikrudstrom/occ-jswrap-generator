const MethodConfiguration = require('./method.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js');

class ConstructorConfiguration extends MethodConfiguration {
  constructor(name, methodKey) {
    super(name, methodKey);
  }

  static wrap(parent, signature) {
    var ctorQuery = `${parent.nativeName}::${parent.nativeName}(${signature})`;
    var ctors = nativeAPI.find(ctorQuery, 'constructor')
      .filter(ctor => ctor.copyConstructor !== true);
    return MethodConfiguration.$wrapMethod(
      parent, new ConstructorConfiguration(parent.name, ctors));
  }
}
ConstructorConfiguration.prototype.type = 'constructor';
ClassConfiguration.registerType('constructor', ConstructorConfiguration.wrap);

module.exports = ConstructorConfiguration;
