const DeclarationDefinition = require('./declaration.js');
const nativeAPI = require('../nativeAPI');

class PropertyDefinition extends DeclarationDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.getter = factory.create(conf.getter, this, typemap, parent);
    if (conf.setter)
      this.setter = factory.create(conf.setter, this, typemap, parent);
    this.readOnly = conf.readOnly;
  }


  getType() {
    return nativeAPI.get(this.getter.methodKey).returnType;
  }

  getKeys() {
    return [this.setter.methodKey, this.getter.methodKey];
  }

  getWrappedDependencies() {
    return this.getter.getWrappedDependencies();
  }

  canBeWrapped() {
    return this.getter.canBeWrapped() &&
      (this.readOnly || this.setter.canBeWrapped());
  }
}
PropertyDefinition.prototype.type = 'property';


module.exports = PropertyDefinition;