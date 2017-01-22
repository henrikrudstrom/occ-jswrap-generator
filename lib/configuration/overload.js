const ConfigurationBase = require('./base.js');
const nativeAPI = require('../nativeAPI');
const extend = require('extend');

class MethodOverloadConfiguration extends ConfigurationBase {
  constructor(name, method, type) {
    super(name);
    this.methodKey = method.key;
    this.declType = type || 'methodOverload';
    this.nativeName = method.name;

    this.args = method.arguments
      .map(arg => extend({ }, arg));
    this.returnType = method.return.type;
  }

  setOutArgs(names) {
    this.args
      .filter(arg => arg.ref && !arg.const)
      .forEach((arg) => {
        arg.name = names[arg.name] || arg.name;
        arg.out = true;
      });
  }
}

module.exports = MethodOverloadConfiguration;
