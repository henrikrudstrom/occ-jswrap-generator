const ConfigurationBase = require('./base.js');
const nativeAPI = require('../nativeAPI');
const extend = require('extend');

class MethodOverloadConfiguration extends ConfigurationBase {
  constructor(name, methodKey, type) {
    super(name);
    this.methodKey = methodKey;
    this.declType = type || 'methodOverload';
    var nativeMethod = nativeAPI.get(this.methodKey);
    this.arguments = nativeMethod.arguments
      .map((arg, i) => extend({ index: i, declType: 'argument' }, arg));
  }

  setOutArgs(names) {
    this.arguments
      .filter(arg => arg.ref && !arg.const)
      .forEach((arg) => {
        arg.name = names[arg.name] || arg.name;
        arg.declType = 'outArgument';
        arg.out = true;
      });
  }
}

module.exports = MethodOverloadConfiguration;
