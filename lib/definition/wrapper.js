const ContainerDefinition = require('./container.js');

class WrapperDefinition extends ContainerDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
  }
}
WrapperDefinition.prototype.declType = 'wrapper';

module.exports = WrapperDefinition;
