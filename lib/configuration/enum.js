const BaseConfiguration = require('./base.js');
const ModuleConfiguration = require('./module.js');
const nativeAPI = require('../nativeAPI.js');

class EnumConfiguration extends BaseConfiguration {
  constructor(name, key, values) {
    super(name);
    this.nativeName = key;
    this.isType = true;
    this.values = values;
  }

  static wrap(parent, query, renameFunc) {
    var rename = renameFunc;
    if (typeof (renameFunc) === 'string')
      rename = () => renameFunc;
    var res = nativeAPI.get(query);
    var values = res.values.map(val => ({ name: val[0].split('_')[1], value: val[0] }));
    return new EnumConfiguration(rename(res.name), res.name, values);
  }
}

EnumConfiguration.prototype.declType = 'enum';
ModuleConfiguration.registerType('enum', EnumConfiguration.wrap);

module.exports = EnumConfiguration;
