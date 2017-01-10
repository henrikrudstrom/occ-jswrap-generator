const ContainerDefinition = require('./container.js');

class WrapperDefinition extends ContainerDefinition {
  constructor(conf, factory, typemap, parent) {
    super(conf, factory, typemap, parent);
    
    this.members = conf.members
      .sort((a, b) => ((a.declType + a.name) <= (b.declType + b.name) ? -1 : 1))
      .map(decl => factory.create(decl, this));
  }
}
WrapperDefinition.prototype.declType = 'wrapper';

module.exports = WrapperDefinition;
