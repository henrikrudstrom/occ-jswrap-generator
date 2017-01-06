const DeclarationConfiguration = require('./declaration.js');
const MethodOverloadConfiguration = require('./methodOverload.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js');
const groupBy = require('../util.js').groupBy;
const renameMember = require('../util.js').renameMember;

class CallableConfiguration extends DeclarationConfiguration {
  constructor(name, methods) {
    super(name);

    this.overloads = methods.map(method => new MethodOverloadConfiguration(name, method.key));
  }

  getKeys() {
    return [this.overloads.map(overload => overload.methodKey)];
  }
}


class MethodConfiguration extends CallableConfiguration {
  static wrap(parent, query, renameFunc) {
    var rename = renameFunc;
    if (typeof (renameFunc) === 'string')
      rename = () => renameFunc;

    query = `${parent.nativeName}::${query}`;
    var methods = nativeAPI.find(query, 'method');
    var grouped = groupBy(methods, method => method.name, {});


    return Object.keys(grouped).map(group =>
      new MethodConfiguration(rename(group), grouped[group]));
  }
}
MethodConfiguration.prototype.type = 'method';
ClassConfiguration.registerType('method', MethodConfiguration.wrap);


class ConstructorConfiguration extends CallableConfiguration {
  static wrap(parent, signature) {
    signature = signature || '*';
    var ctorQuery = `${parent.nativeName}::${parent.nativeName}(${signature})`;
    var ctors = nativeAPI.find(ctorQuery, 'constructor')
      .filter(ctor => ctor.copyConstructor !== true);
    return new ConstructorConfiguration(parent.name, ctors);
  }
}
ConstructorConfiguration.prototype.type = 'constructor';
ClassConfiguration.registerType('constructor', ConstructorConfiguration.wrap);


class SetterConfiguration extends CallableConfiguration {
  // static wrap(parent, query, renameFunc) {
  //   var rename = renameFunc;
  //   if (typeof (renameFunc) === 'string')
  //     rename = () => renameFunc;
  //
  //   query = `${parent.nativeName}::${query}`;
  //   var methods = nativeAPI.find(query, 'method');
  //   var grouped = groupBy(methods, method => method.name, {});
  //   return Object.keys(grouped).map(group =>
  //       new MethodConfiguration(rename(group), grouped[group]));
  // }
}
SetterConfiguration.prototype.type = 'setter';


class GetterConfiguration extends CallableConfiguration {
  constructor(name, methods) {
    super(name, methods);
    this.readOnly = true;
  }
    // static wrap(parent, query, renameFunc) {
    //   var rename = renameFunc;
    //   if (typeof (renameFunc) === 'string')
    //     rename = () => renameFunc;
    //
    //   query = `${parent.nativeName}::${query}`;
    //   var methods = nativeAPI.find(query, 'method');
    //   var grouped = groupBy(methods, method => method.name, {});
    //   return Object.keys(grouped).map(group =>
    //       new MethodConfiguration(rename(group), grouped[group]));
    // }
}
GetterConfiguration.prototype.type = 'getter';


function wrapProperty(parent, getterKey, setterKey, name) {
  var query = `${parent.nativeName}::${getterKey}`;
  var methods = nativeAPI.find(query, 'method');
  var getter = new GetterConfiguration(name || renameMember(getterKey), methods);
  if (!setterKey)
    return [getter];
  query = `${parent.nativeName}::${setterKey}`;
  methods = nativeAPI.find(query, 'method');
  var setter = new SetterConfiguration(renameMember(setterKey), methods);
  getter.setterName = setter.name;
  getter.readOnly = false;

  return [getter, setter];
}

function wrapReadOnlyProperty(parent, getterKey, name) {
  return wrapProperty(parent, getterKey, undefined, name);
}

ClassConfiguration.registerType('property', wrapProperty);
ClassConfiguration.registerType('readOnlyProperty', wrapReadOnlyProperty);


module.exports = { MethodConfiguration, GetterConfiguration, SetterConfiguration };