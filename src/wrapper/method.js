const Declaration = require('./declaration.js');
const MethodOverload = require('./methodOverload.js');

const definitions = require('./definitions.js');
const nativeAPI = require('../nativeAPI');


class MethodDefinition extends Declaration.Definition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
    this.overloads = conf.overloads.map(
      overload => new MethodOverload.Definition(wrapperAPI, overload)
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

definitions.register('method', MethodDefinition);


class MethodConfiguration extends Declaration.Configuration {
  constructor(name, methodKey) {
    super(name);
    this.overloads = [new MethodOverload.Configuration(methodKey)];
    this.declType = 'method';
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
