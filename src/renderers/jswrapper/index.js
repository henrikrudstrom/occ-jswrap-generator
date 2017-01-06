const ClassRenderer = require('./class.js');
const ModuleRenderer = require('./module.js');
const Overload = require('./overload.js');
const BuiltinRenderer = require('./builtin.js');
const WrapperRenderer = require('./wrapper.js');
const callable = require('./callable.js');

module.exports = {
  WrapperRenderer,
  ClassRenderer,
  ModuleRenderer,
  MethodRenderer: callable.MethodRenderer,
  ConstructorRenderer: callable.ConstructorRenderer,
  GetterRenderer: callable.GetterRenderer,
  SetterRenderer: callable.SetterRenderer,
  OverloadMethodRenderer: Overload.MethodRenderer,
  OverloadConstructorRenderer: Overload.ConstructorRenderer,
  BuiltinRenderer
};

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);
