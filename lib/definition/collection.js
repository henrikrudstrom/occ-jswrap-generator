const DefinitionBase = require('./base.js');

class CollectionDefinition extends DefinitionBase {
  constructor(conf, factory, typemap, parent) {
    super(conf, factory, typemap, parent);
    this.nativeName = conf.nativeName;
    this.qualifiedName = this.name;
    this.isType = true;
    this.customBuilder = conf.customBuilder;
    this.jsname = this.name;
    this.containerType = conf.containerType;
    this.containedType = conf.containedType;
    this.relativePath = `${this.parent.name}/${this.name}`;
  }

  getBaseLevel() {
    return 0;
  }

  getWrappedDependencies() {
    return this.typemap.getWrappedType(this.containedType);
  }
}
CollectionDefinition.prototype.declType = 'collection';

module.exports = CollectionDefinition;
