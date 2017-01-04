const Container = require('./container.js');

class WrapperDefinition extends Container.Definition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
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
