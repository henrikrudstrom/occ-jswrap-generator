  const DefinitionBase = require('./base.js');

  class EnumDefinition extends DefinitionBase {
    constructor(conf, factory, typemap, parent) {
      super(conf, factory, typemap, parent);
      this.nativeName = conf.nativeName;
      this.qualifiedName = `${this.parent.name}::${this.name}`;
      this.jsname = 'Number';
      this.isType = true;
      this.values = conf.values;
    }
    getBaseLevel() {
      return 0;
    }

    getWrappedDependencies() {
      return [];
    }
  }
  EnumDefinition.prototype.declType = 'enum';
  module.exports = EnumDefinition;
