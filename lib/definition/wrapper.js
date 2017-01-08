const ContainerDefinition = require('./container.js');

class WrapperDefinition extends ContainerDefinition {
  constructor(conf, factory, typemap, parent) {
    super(conf, factory, typemap, parent);
  }
}
WrapperDefinition.prototype.declType = 'wrapper';

module.exports = WrapperDefinition;
