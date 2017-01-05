const Container = require('./container.js');

class WrapperDefinition extends Container.Definition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
  }
}

class WrapperConfiguration extends Container.Configuration {
  constructor(name, modules) {
    super(name, 'wrapper');
    this.members = modules;
  }
}

module.exports = {
  Configuration: WrapperConfiguration,
  Definition: WrapperDefinition
};
