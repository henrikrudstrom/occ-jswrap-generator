const ConfigurationBase = require('./base.js');
const MethodOverloadConfiguration = require('./overload.js');
const nativeAPI = require('../nativeAPI');
const ClassConfiguration = require('./class.js');
const groupBy = require('../util.js').groupBy;
const renameMember = require('../util.js').renameMember;

class CallableConfiguration extends ConfigurationBase {
  constructor(name, methods, overloadType) {
    super(name);
    this.overloads = methods
      .map(method => new MethodOverloadConfiguration(name, method, overloadType));
  }

  addOverloads(config) {
    this.overloads = this.overloads.concat(config.overloads)
      .filter((overload, i, array) => array.map(o => o.methodKey).indexOf(overload.methodKey) === i);
  }

  setOutArgs(names) {
    names = names || {};
    this.overloads.forEach((overload) => {
      overload.setOutArgs(names);
    });
  }

  downcast(type) {
    this.overloads.forEach((overload) => {
      overload.specializedReturnType = type;
    });
  }
}

class MethodConfiguration extends CallableConfiguration {

}
MethodConfiguration.prototype.declType = 'method';

class ConstructorConfiguration extends CallableConfiguration {
  static wrap(parent, queryOrObject, overloadType) {
    let constructors = [];
    if (queryOrObject === undefined) constructors = '*';
    if (typeof (queryOrObject) === 'string') {
      var ctorQuery = `${parent.nativeName}::${parent.nativeName}(${queryOrObject})`;
      constructors = nativeAPI.find(ctorQuery, 'constructor')
        .filter(ctor => ctor.copyConstructor !== true);
    } else if (!Array.isArray(queryOrObject)) {
      constructors = [queryOrObject];
    } else {
      constructors = queryOrObject;
    }
    return new ConstructorConfiguration('New', constructors, overloadType || 'constructorOverload');
  }
}
ConstructorConfiguration.prototype.declType = 'constructor';
ClassConfiguration.registerType('constructor', ConstructorConfiguration.wrap);

class GetterConfiguration extends CallableConfiguration {
  constructor(name, methods) {
    super(name, methods, 'getterOverload');
    this.readOnly = true;
  }
}
GetterConfiguration.prototype.declType = 'getter';

class SetterConfiguration extends CallableConfiguration {
  constructor(name, methods) {
    super(name, methods, 'setterOverload');
  }
}
SetterConfiguration.prototype.declType = 'setter';

class IndexedGetterConfiguration extends CallableConfiguration {
  constructor(name, methods) {
    super(name, methods, 'indexedGetterOverload');
  }
}
IndexedGetterConfiguration.prototype.declType = 'indexedGetter';

class IndexedSetterConfiguration extends CallableConfiguration {
  constructor(name, methods) {
    super(name, methods, 'indexedSetterOverload');
  }
}
IndexedSetterConfiguration.prototype.declType = 'indexedSetter';

function createWrapFunction(Constructor) {
  return function wrapMethod(parent, query, newName, methods) {
    var rename = renameMember;
    if (typeof (newName) === 'string')
      rename = () => newName;

    query = `${parent.nativeName}::${query}`;
    if (methods === undefined)
      methods = nativeAPI.find(query, 'method');
    if (!Array.isArray(methods))
      methods = [methods];
    var grouped = groupBy(methods, method => method.name, {});


    return Object.keys(grouped).map(group =>
      new Constructor(rename(group), grouped[group]));
  };
}

var wrapMethod = createWrapFunction(MethodConfiguration);

function createWrapPropertyFunction(GetterCtor, SetterCtor) {
  return function wrapProperty(parent, getterKey, setterKey, name, getterMethod, setterMethod) {
    const getters = createWrapFunction(GetterCtor)(parent, getterKey, name, getterMethod);
    let setters = [];
    if (setterKey !== undefined)
      setters = createWrapFunction(SetterCtor)(parent, setterKey, undefined, setterMethod);
    if (setters.length > 1 || getters.length > 1)
      throw new Error('multiple getters not supported yet');

    if (setters.length === 0) {
      return [getters[0]];
    }

    getters[0].setterName = setters[0].name;
    return [getters[0], setters[0]];
  };
}

const wrapProperty = createWrapPropertyFunction(GetterConfiguration, SetterConfiguration);

function wrapReadOnlyProperty(parent, getterKey, name, getterMethod) {
  return wrapProperty(parent, getterKey, undefined, name, getterMethod);
}

const wrapIndexedProperty =
  createWrapPropertyFunction(IndexedGetterConfiguration, IndexedSetterConfiguration);

function wrapIndexedReadOnlyProperty(parent, getterKey, name) {
  return wrapProperty(parent, getterKey, undefined, name);
}

ClassConfiguration.registerType('method', wrapMethod);
ClassConfiguration.registerType('property', wrapProperty);
ClassConfiguration.registerType('readOnlyProperty', wrapReadOnlyProperty);
ClassConfiguration.registerType('indexedProperty', wrapIndexedProperty);
ClassConfiguration.registerType('indexedReadOnlyProperty', wrapIndexedReadOnlyProperty);
module.exports = {
  MethodConfiguration,
  ConstructorConfiguration,
  GetterConfiguration,
  SetterConfiguration,
  IndexedGetterConfiguration,
  IndexedSetterConfiguration
};
