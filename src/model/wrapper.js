const Container = require('./container.js');

class WrapperConfiguration extends Container.Configuration {
  constructor(name, modules) {
    super(name);
    this.members = modules;
  }
}
WrapperConfiguration.prototype.type = 'wrapper';

class WrapperDefinition extends Container.Definition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
  }
}
WrapperDefinition.prototype.type = 'wrapper';

module.exports = {
  Configuration: WrapperConfiguration,
  Definition: WrapperDefinition
};
