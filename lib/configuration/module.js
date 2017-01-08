const ContainerConfiguration = require('./container.js');
const ClassConfiguration = require('./class.js');
const nativeAPI = require('../nativeAPI.js');

class ModuleConfiguration extends ContainerConfiguration {
  constructor(name) {
    super(name || 'unnamed-module');
  }
}
ModuleConfiguration.prototype.declType = 'module';

module.exports = ModuleConfiguration;
