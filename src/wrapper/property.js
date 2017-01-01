const DeclarationConfiguration = require('./declaration.js').configuration;
const DeclarationDefinition = require('./declaration.js').definition;
const definitions = require('./definitions.js');

class PropertyDefinition extends DeclarationDefinition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
    this.getterKey = conf.getterKey;
    this.setterKey = conf.setterKey;
    this.declType = conf.declType;
  }

  getKeys() {
    return [this.setterKey, this.getterKey];
  }
}

definitions.register('class', PropertyDefinition);

class PropertyConfiguration extends DeclarationConfiguration {
  constructor(parent, name, getterKey, setterKey) {
    super(parent, name);
    this.getterKey = getterKey;
    this.setterKey = setterKey;
    this.declType = 'property';
  }

  getKeys() {
    return [this.setterKey, this.getterKey];
  }
}

module.exports = {
  configuration: PropertyConfiguration,
  definition: PropertyDefinition
};
