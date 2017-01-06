const ContainerConfiguration = require('./container.js');
const nativeAPI = require('../nativeAPI.js');

class ClassConfiguration extends ContainerConfiguration {
  constructor(name, key) {
    super(name);
    this.nativeName = key;
    this.isType = true;
  }


  getKeys() {
    return [this.nativeName];
  }
}
ClassConfiguration.prototype.type = 'class';

module.exports = ClassConfiguration;