const Declaration = require('./declaration.js');
const MethodOverload = require('./methodOverload.js');


class MethodDefinition extends Declaration.Definition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.overloads = conf.overloads.map(
      overload => factory.createDefinition(overload, parent, typemap)
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
