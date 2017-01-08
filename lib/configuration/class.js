const ContainerConfiguration = require('./container.js');
const ModuleConfiguration = require('./module.js');
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

  static wrap(parent, query, renameFunc) {
    var rename = renameFunc;
    if (typeof (renameFunc) === 'string')
      rename = () => renameFunc;
    var res = nativeAPI.find(query);
    return res.map(decl => new ClassConfiguration(rename(decl.name), decl.name));
  }
}

ClassConfiguration.prototype.declType = 'class';
ModuleConfiguration.registerType('class', ClassConfiguration.wrap);

module.exports = ClassConfiguration;
