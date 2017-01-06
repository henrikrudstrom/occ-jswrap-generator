const ContainerDefinition = require('./container.js');
const nativeAPI = require('../nativeAPI.js');

class ModuleDefinition extends ContainerDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
  }

}
ModuleDefinition.prototype.type = 'module';

module.exports = ModuleDefinition;