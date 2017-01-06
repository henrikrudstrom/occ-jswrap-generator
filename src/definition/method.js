const DeclarationDefinition = require('./declaration.js');
const nativeAPI = require('../nativeAPI');

class MethodDefinition extends DeclarationDefinition {
  constructor(conf, parent, factory, typemap, parentClass) {
    super(conf, parent, factory, typemap);
    this.overloads = conf.overloads.map(
      overload => factory.create(overload, this, typemap, parentClass || this)
    );
    this.overloads.forEach((overload, index) => { overload.index = index; });
    this.type = conf.type;
    this.cppName = this.overloads[0].nativeMethod.name;
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
MethodDefinition.prototype.type = 'method';

module.exports = MethodDefinition;