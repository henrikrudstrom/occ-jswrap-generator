const Declaration = require('./declaration.js');
const MethodOverload = require('./methodOverload.js');
const factory = require('../factory.js');


class MethodDefinition extends Declaration.Definition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
    this.overloads = conf.overloads.map(
      overload => factory.createDefinition(wrapperAPI, this, overload)
    );
    this.declType = conf.declType;
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

  getKeys() {
    return [this.methodKey];
  }
}

factory.registerDefinition('method', MethodDefinition);


class MethodConfiguration extends Declaration.Configuration {
  constructor(name, methodKey) {
    super(name, 'method');
    this.overloads = [new MethodOverload.Configuration(name, methodKey)];
  }

  overload(methodConf) {
    this.overloads = this.overloads.concat(methodConf.overloads);
  }

  getKeys() {
    return [this.overloads.map(overload => overload.methodKey)];
  }
}

module.exports = {
  Configuration: MethodConfiguration,
  Definition: MethodDefinition
};
