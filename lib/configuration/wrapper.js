const ContainerConfiguration = require('./container.js');

class WrapperConfiguration extends ContainerConfiguration {
  constructor(name, modules) {
    super(name);
    this.members = modules;
  }
}
WrapperConfiguration.prototype.declType = 'wrapper';

module.exports = WrapperConfiguration;
