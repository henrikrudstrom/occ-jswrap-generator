const ConfigurationBase = require('./base.js');
const nativeAPI = require('../nativeAPI');
const util = require('../util.js');

class MethodOverloadConfiguration extends ConfigurationBase {
  constructor(name, methodKey, type) {
    super(name);
    this.methodKey = methodKey;
    this.declType = type || 'methodOverload';
  }

  setOutArgs(names) {
    var nativeMethod = nativeAPI.get(this.methodKey);
    this.argouts = {};

    nativeMethod.arguments
      .filter(arg => arg.ref && !arg.const)
      .forEach((arg) => {
        this.argouts[arg.name] = names[arg.name] || util.renameMember(arg.name);
      });
  }
}

module.exports = MethodOverloadConfiguration;
