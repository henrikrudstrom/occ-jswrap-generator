const Method = require('./method.js');

class ConstructorDefinition extends Method.Definition {

}

class ConstructorConfiguration extends Method.Configuration {
  constructor(name, methodKey) {
    super(name, methodKey);
    this.declType = 'constructor';
  }
}

module.exports = {
  Configuration: ConstructorConfiguration,
  Definition: ConstructorDefinition
};
