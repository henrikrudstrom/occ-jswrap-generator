const ConfigurationBase = require('./base.js');
const MethodOverloadConfiguration = require('./overload.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js');
const groupBy = require('../util.js').groupBy;
const renameMember = require('../util.js').renameMember;

class ArgumentConfiguration extends ConfigurationBase {
  constructor(name, nativeDecl) {
    super(name);
    this.nativeType = nativeDecl.type;
  }
}
ArgumentConfiguration.prototype.declType = 'argument';
class OutputArgumentConfiguration extends ArgumentConfiguration {
  constructor(name, nativeDecl) {
    super(name);
    this.nativeType = nativeDecl.type;
  }
}
ArgumentConfiguration.prototype.declType = 'outputArgument';
