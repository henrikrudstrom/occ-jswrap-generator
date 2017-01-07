const DeclarationDefinition = require('./declaration.js');
const nativeAPI = require('../nativeAPI');

class CallableDefinition extends DeclarationDefinition {
  constructor(conf, parent, factory, typemap, parentClass) {
    super(conf, parent, factory, typemap);
    this.overloads = conf.overloads.map(
      overload => factory.create(overload, this, typemap, parentClass || this)
    );
    this.overloads.forEach((overload, index) => { overload.index = index; });
    this.type = conf.type;

  }

  getWrappedDependencies() {
    return this.overloads
      .filter(overload => overload.canBeWrapped())
      .map(overload => overload.getWrappedDependencies())
      .reduce((a, b) => a.concat(b), [])
      .filter((t, index, array) => array.indexOf(t) === index);
  }

  canBeWrapped() {
    return this.overloads.some(overload => overload.canBeWrapped());
  }

}

class MethodDefinition extends CallableDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.cppName = this.overloads[0].nativeMethod.name;
  }
}
MethodDefinition.prototype.type = 'method';

class ConstructorDefinition extends CallableDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.cppName = parent.name;
  }
  canBeWrapped() {
    return this.overloads.length === 0 || super.canBeWrapped();
  }
}
ConstructorDefinition.prototype.type = 'constructor';

class GetterDefinition extends CallableDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.setterName = conf.setterName;
    this.cppName = this.overloads[0].nativeMethod.name;
  }

}
GetterDefinition.prototype.type = 'getter';

class SetterDefinition extends CallableDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.cppName = this.overloads[0].nativeMethod.name;
  }
}
SetterDefinition.prototype.type = 'setter';

module.exports = { MethodDefinition, ConstructorDefinition, SetterDefinition, GetterDefinition };
