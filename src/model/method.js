const Declaration = require('./declaration.js');
const MethodOverload = require('./methodOverload.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js').Configuration;
const groupBy = require('../util.js').groupBy;

class MethodDefinition extends Declaration.Definition {
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


class MethodConfiguration extends Declaration.Configuration {
  constructor(name, methods) {
    super(name);

    this.overloads = methods.map(method => new MethodOverload.Configuration(name, method.key));
  }


  overload(methodConf) {
    this.overloads = this.overloads.concat(methodConf.overloads);
  }

  getKeys() {
    return [this.overloads.map(overload => overload.methodKey)];
  }

  static $wrapMethod(parent, conf) {
    var existingMember = parent.getMemberByName(conf.name);
    if (existingMember !== undefined) {
      conf.overload(existingMember);
      parent.excludeByName(existingMember.name);
    }
    return conf;
  }

  static wrap(parent, query, renameFunc) {
    var rename = renameFunc;
    if (typeof (renameFunc) === 'string')
      rename = () => renameFunc;

    query = `${parent.nativeName}::${query}`;
    var methods = nativeAPI.find(query, 'method');
    var grouped = groupBy(methods, method => method.name, {});
    return Object.keys(grouped).map(group =>
      MethodConfiguration.$wrapMethod(parent,
        new MethodConfiguration(rename(group), grouped[group])));
  }
}
MethodConfiguration.prototype.type = 'method';
ClassConfiguration.registerType('method', MethodConfiguration.wrap);


module.exports = {
  Configuration: MethodConfiguration,
  Definition: MethodDefinition
};
