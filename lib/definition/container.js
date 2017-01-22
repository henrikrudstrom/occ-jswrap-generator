const DefinitionBase = require('./base.js');
const containerMixin = require('../containerMixin.js');

class ContainerDefinition extends containerMixin(DefinitionBase) {
  containerMixinGetChildren() {
    return this.members;
  }
}

module.exports = ContainerDefinition;
