const DeclarationConfiguration = require('./declaration.js');
const MethodConfiguration = require('./method.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js');
const util = require('../util.js');

class PropertyConfiguration extends DeclarationConfiguration {
  constructor(name, getter, setter) {
    super(name);
    this.getter = getter;
    this.setter = setter;
    this.readOnly = !setter;
  }

  getKeys() {
    return [this.setter.methodKey, this.getter.methodKey];
  }

  static wrap(parent, getterKey, setterKey, name) {
    var getter = MethodConfiguration.wrap(parent, getterKey, util.renameMember(getterKey))[0];
    var setter = setterKey ?
      MethodConfiguration.wrap(parent, setterKey, util.renameMember(setterKey))[0] : undefined;
    return new PropertyConfiguration(name, getter, setter);
  }

  static wrapReadOnly(parent, getterKey, name) {
    return PropertyConfiguration.wrap(parent, getterKey, undefined, name);
  }
}
PropertyConfiguration.prototype.type = 'property';
ClassConfiguration.registerType('property', PropertyConfiguration.wrap);
ClassConfiguration.registerType('readOnlyProperty', PropertyConfiguration.wrapReadOnly);


module.exports = PropertyConfiguration;
