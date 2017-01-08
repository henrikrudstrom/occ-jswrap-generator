const Builtin = require('./builtin.js');
const Class = require('./class.js');
const callable = require('./callable.js');
const Module = require('./module.js');
const overload = require('./overload.js');
const Wrapper = require('./wrapper.js');

module.exports = {
  Builtin,
  Class,
  Method: callable.MethodDefinition,
  Constructor: callable.ConstructorDefinition,
  Getter: callable.GetterDefinition,
  Setter: callable.SetterDefinition,
  Module,
  MethodOverload: overload.MethodOverloadDefinition,
  ConstructorOverload: overload.ConstructorOverloadDefinition,
  GetterOverload: overload.GetterOverloadDefinition,
  SetterOverload: overload.SetterOverloadDefinition,
  Wrapper
};

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);