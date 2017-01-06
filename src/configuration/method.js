const DeclarationConfiguration = require('./declaration.js');
const MethodOverloadConfiguration = require('./methodOverload.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js');
const groupBy = require('../util.js').groupBy;

class MethodConfiguration extends DeclarationConfiguration {
  constructor(name, methods) {
    super(name);

    this.overloads = methods.map(method => new MethodOverloadConfiguration(name, method.key));
  }


  overload(methodConf) {
    this.overloads = this.overloads.concat(methodConf.overloads);
  }

  getKeys() {
    return [this.overloads.map(overload => overload.methodKey)];
  }

  static $wrapMethod(parent, conf) {
    var existingMember = parent.getMemberByName(conf.name);
    if (existingMember !== undefined) {
      conf.overload(existingMember);
      parent.excludeByName(existingMember.name);
    }
    return conf;
  }

  static wrap(parent, query, renameFunc) {
    var rename = renameFunc;
    if (typeof (renameFunc) === 'string')
      rename = () => renameFunc;
    
    query = `${parent.nativeName}::${query}`;
    var methods = nativeAPI.find(query, 'method');
    var grouped = groupBy(methods, method => method.name, {});
    return Object.keys(grouped).map(group =>
      MethodConfiguration.$wrapMethod(parent,
        new MethodConfiguration(rename(group), grouped[group])));
  }
}
MethodConfiguration.prototype.type = 'method';
ClassConfiguration.registerType('method', MethodConfiguration.wrap);


module.exports = MethodConfiguration;
