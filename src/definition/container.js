const DeclarationDefinition = require('./declaration.js');
const containerMixin = require('../containerMixin.js');

class ContainerDefinition extends containerMixin(DeclarationDefinition) {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.members = conf.members
      .sort((a, b) => ((a.type + a.name) <= (b.type + b.name) ? -1 : 1))
      .map(decl => factory.create(decl, this, typemap));
  }

  containerMixinGetChildren() {
    return this.members;
  }
}

module.exports = ContainerDefinition;
