const Builtin = require('./builtin.js');
const Class = require('./class.js');
const callable = require('./callable.js');
const Module = require('./module.js');
const overload = require('./overload.js');
const Wrapper = require('./wrapper.js');
const Collection = require('./collection.js');
const builder = require('./builder.js');
const Enum = require('./enum.js');

module.exports = {
  Builtin,
  Class,
  Collection,
  Method: callable.MethodDefinition,
  Constructor: callable.ConstructorDefinition,
  Getter: callable.GetterDefinition,
  Setter: callable.SetterDefinition,
  Module,
  MethodOverload: overload.MethodOverloadDefinition,
  ConstructorOverload: overload.ConstructorOverloadDefinition,
  GetterOverload: overload.GetterOverloadDefinition,
  SetterOverload: overload.SetterOverloadDefinition,
  Builder: builder.BuilderDefinition,
  BuilderOverload: builder.BuilderOverloadDefinition,
  Wrapper,
  Enum
};

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);
