const ContainerConfiguration = require('./container.js');
const ModuleConfiguration = require('./module.js');
const nativeAPI = require('../nativeAPI.js');
const util = require('../util.js');

class ClassConfiguration extends ContainerConfiguration {
  constructor(name, key) {
    super(name);
    this.nativeName = key;
    this.isType = true;
  }

  static wrap(parent, query, newName) {
    let rename = util.renameClass;
    if (typeof (newName) === 'string')
      rename = () => newName;

    var res = nativeAPI.find(query);
    return res.map(decl => new ClassConfiguration(rename(decl.name), decl.name));
  }
}

ClassConfiguration.prototype.declType = 'class';
ModuleConfiguration.registerType('class', ClassConfiguration.wrap);

module.exports = ClassConfiguration;
