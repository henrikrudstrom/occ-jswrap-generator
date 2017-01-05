const Declaration = require('./declaration.js');
const Method = require('./method.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js').Configuration;
const util = require('../util.js');

class PropertyDefinition extends Declaration.Definition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.getter = factory.createDefinition(conf.getter, parent, typemap);
    if (conf.setter)
      this.setter = factory.createDefinition(conf.setter, parent, typemap);
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

class PropertyConfiguration extends Declaration.Configuration {
  constructor(name, getter, setter) {
    super(name, 'property');
    this.getter = getter;
    this.setter = setter;
    this.readOnly = !setter;
  }

  getKeys() {
    return [this.setter.methodKey, this.getter.methodKey];
  }
  
  static wrap(parent, getterKey, setterKey, name) {
    var getter = Method.Configuration.wrap(parent, getterKey, util.renameMember(getterKey));
    var setter = setterKey ? Method.Configuration.wrap(parent, setterKey, util.renameMember(setterKey)) : undefined;
    return new PropertyConfiguration(name, getter, setter)
  }
  
  static wrapReadOnly(parent, getterKey, name) {
    return PropertyConfiguration.wrap(parent, getterKey, undefined, name);
  }
}


ClassConfiguration.registerType('property', PropertyConfiguration.wrap);
ClassConfiguration.registerType('readOnlyProperty', PropertyConfiguration.wrapReadOnly);

module.exports = {
  Configuration: PropertyConfiguration,
  Definition: PropertyDefinition
};
