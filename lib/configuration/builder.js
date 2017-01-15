const ClassConfiguration = require('./class.js');
const ConfigurationBase = require('./base.js');
const nativeAPI = require('../nativeAPI.js');
const MethodOverloadConfiguration = require('./overload.js');

class BuilderConfiguration extends ConfigurationBase {
  constructor(name, builderClass, overloads, resultGetters) {
    super(name);
    this.nativeName = builderClass;
    this.resultGetters = resultGetters;
    this.overloads = overloads
      .map(method => new MethodOverloadConfiguration(name, method.key, 'builderOverload'));
  }

  static wrap(parent, query, name, resultGetters) {
    var res = nativeAPI.get(query);
    // get constructors...
    var overloads = nativeAPI.find(`${res.name}::${res.name}`)
      .filter(ctor => ctor.copyConstructor !== true);
    if (!Array.isArray(resultGetters))
      resultGetters = [resultGetters];

    resultGetters.forEach((getter) => {
      var native = nativeAPI.get(`${res.name}::${getter.method}`);
      getter.type = native.return.type;
    });

    return new BuilderConfiguration(name, res.name, overloads, resultGetters);
  }
}
BuilderConfiguration.prototype.declType = 'builder';

ClassConfiguration.registerType('Builder', BuilderConfiguration.wrap);

module.exports = BuilderConfiguration;
