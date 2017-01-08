const DefinitionBase = require('./base.js');
const containerMixin = require('../containerMixin.js');

class ContainerDefinition extends containerMixin(DefinitionBase) {
  constructor(conf, factory, typemap, parent) {
    super(conf, factory, typemap, parent);
    this.members = conf.members
      .sort((a, b) => ((a.declType + a.name) <= (b.declType + b.name) ? -1 : 1))
      .map(decl => factory.create(decl, this));
  }

  containerMixinGetChildren() {
    return this.members;
  }
}

module.exports = ContainerDefinition;
