'use strict'
const Method = require('./method.js');
const factory = require('../factory.js');


class ConstructorDefinition extends Method.Definition {

}

class ConstructorConfiguration extends Method.Configuration {
  constructor(name, methodKey) {
    super(name, methodKey);
    this.declType = 'constructor';
  }
}

factory.registerDefinition('constructor', ConstructorDefinition);

module.exports = {
  Configuration: ConstructorConfiguration,
  Definition: ConstructorDefinition
};
