const DefinitionBase = require('./base.js');

class BuiltinDefinition extends DefinitionBase {
  constructor(conf, factory, typemap, parent) {
    super(conf, factory, typemap, parent);
    this.nativeName = conf.nativeName;
    this.isType = true;
    this.isBuiltIn = true;
  }
  
  getBaseLevel() {
    return 0;
  }
}
BuiltinDefinition.prototype.declType = 'builtin';

module.exports = BuiltinDefinition;
