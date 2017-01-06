const DeclarationDefinition = require('./declaration.js');

class BuiltinDefinition extends DeclarationDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.nativeName = conf.nativeName;
    this.isType = true;
    this.isBuiltIn = true;
  }
}
BuiltinDefinition.prototype.type = 'builtin';

module.exports = BuiltinDefinition;