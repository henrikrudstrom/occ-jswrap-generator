const Declaration = require('./declaration.js');
const definitions = require('./definitions.js');
const nativeAPI = require('../nativeAPI');

class PropertyDefinition extends Declaration.Definition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
    this.getterKey = conf.getterKey;
    this.setterKey = conf.setterKey;
    this.declType = conf.declType;
    this.readOnly = conf.readOnly;
    this.nativeGetter = nativeAPI.get(this.getterKey);
    this.cppGetterName = this.nativeGetter.name;
    if (!this.readOnly) {
      this.nativeSetter = nativeAPI.get(this.setterKey);
      this.cppSetterName = this.nativeSetter.name;
    }
  }

  getType() {
    return nativeAPI.get(this.getterKey).returnType;
  }

  getKeys() {
    return [this.setterKey, this.getterKey];
  }

  getWrappedDependencies() {
    var type = this.wrapperAPI.getWrappedType(this.nativeGetter.returnType);
    if (type === 'double' || type === 'bool' || type === 'int32_t')
      return [];
    return [type];
  }

  canBeWrapped() {
    return this.wrapperAPI.isValidType(this.nativeGetter.returnType);
  }
}

definitions.register('property', PropertyDefinition);

class PropertyConfiguration extends Declaration.Configuration {
  constructor(name, getterKey, setterKey) {
    super(name);
    this.getterKey = getterKey;
    this.setterKey = setterKey;
    this.declType = 'property';
    this.readOnly = !this.setterKey;
  }

  getKeys() {
    return [this.setterKey, this.getterKey];
  }
}

module.exports = {
  Configuration: PropertyConfiguration,
  Definition: PropertyDefinition
};
