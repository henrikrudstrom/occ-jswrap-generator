const Declaration = require('./declaration.js');
const Method = require('./method.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js').Configuration;
const util = require('../util.js');

class PropertyDefinition extends Declaration.Definition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.getter = factory.create(conf.getter, parent, typemap);
    if (conf.setter)
      this.setter = factory.create(conf.setter, parent, typemap);
    this.readOnly = conf.readOnly;
  }


  getType() {
    return nativeAPI.get(this.getter.methodKey).returnType;
  }

  getKeys() {
    return [this.setter.methodKey, this.getter.methodKey];
  }

  getWrappedDependencies() {
    return this.getter.getWrappedDependencies();
  }

  canBeWrapped() {
    return this.getter.canBeWrapped() &&
      (this.readOnly || this.setter.canBeWrapped());
  }
}
PropertyDefinition.prototype.type = 'property';

class PropertyConfiguration extends Declaration.Configuration {
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
    var getter = Method.Configuration.wrap(parent, getterKey, util.renameMember(getterKey))[0];
    var setter = setterKey ?
      Method.Configuration.wrap(parent, setterKey, util.renameMember(setterKey))[0] : undefined;
    return new PropertyConfiguration(name, getter, setter);
  }

  static wrapReadOnly(parent, getterKey, name) {
    return PropertyConfiguration.wrap(parent, getterKey, undefined, name);
  }
}
PropertyConfiguration.prototype.type = 'property';
ClassConfiguration.registerType('property', PropertyConfiguration.wrap);
ClassConfiguration.registerType('readOnlyProperty', PropertyConfiguration.wrapReadOnly);


module.exports = {
  Configuration: PropertyConfiguration,
  Definition: PropertyDefinition
};
