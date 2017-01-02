const Method = require('./method.js');
const definitions = require('./definitions.js');

class ConstructorDefinition extends Method.Definition {

}

class ConstructorConfiguration extends Method.Configuration {
  constructor(name, methodKey) {
    super(name, methodKey);
    this.declType = 'constructor';
  }
}

definitions.register('constructor', ConstructorDefinition);

module.exports = {
  Configuration: ConstructorConfiguration,
  Definition: ConstructorDefinition
};
