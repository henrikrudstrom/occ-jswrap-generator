const DefinitionBase = require('./base.js');
const nativeAPI = require('../nativeAPI');

class CallableDefinition extends DefinitionBase {
  constructor(conf, factory, typemap, parent, parentClass) {
    super(conf, factory, typemap, parent);
    this.overloads = conf.overloads.map(
      overload => factory.create(overload, this, parentClass || this)
    );
    this.overloads.forEach((overload, index) => { overload.index = index; });
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
}
MethodDefinition.prototype.declType = 'method';

class ConstructorDefinition extends CallableDefinition {
  canBeWrapped() {
    return this.overloads.length === 0 || super.canBeWrapped();
  }
}
ConstructorDefinition.prototype.declType = 'constructor';

class GetterDefinition extends CallableDefinition {
}
GetterDefinition.prototype.declType = 'getter';

class SetterDefinition extends CallableDefinition {
}
SetterDefinition.prototype.declType = 'setter';

class IndexedGetterDefinition extends CallableDefinition {
}
IndexedGetterDefinition.prototype.declType = 'indexedGetter';

class IndexedSetterDefinition extends CallableDefinition {
}
IndexedSetterDefinition.prototype.declType = 'indexedSetter';

module.exports = {
  CallableDefinition,
  MethodDefinition,
  ConstructorDefinition,
  SetterDefinition,
  GetterDefinition,
  IndexedGetterDefinition,
  IndexedSetterDefinition
};
