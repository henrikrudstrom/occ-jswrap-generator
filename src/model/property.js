const Declaration = require('./declaration.js');
const Method = require('./method.js');
const nativeAPI = require('../nativeAPI');

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
  constructor(name, getterKey, setterKey) {
    super(name, 'property');
    this.getter = new Method.Configuration(name, getterKey);
    this.setter = setterKey ? new Method.Configuration(name, setterKey) : undefined;
    this.readOnly = !setterKey;
  }

  getKeys() {
    return [this.setter.methodKey, this.getter.methodKey];
  }
}

module.exports = {
  Configuration: PropertyConfiguration,
  Definition: PropertyDefinition
};
