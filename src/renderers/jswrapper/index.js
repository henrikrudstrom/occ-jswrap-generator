const ClassRenderer = require('./class.js');
const ConstructorRenderer = require('./constructor.js');
const MethodRenderer = require('./method.js');
const ModuleRenderer = require('./module.js');
const Overload = require('./overload.js');
const PropertyRenderer = require('./property.js');
const BuiltinRenderer = require('./builtin.js');
const WrapperRenderer = require('./wrapper.js');

module.exports = [
  WrapperRenderer,
  ClassRenderer,
  ConstructorRenderer,
  MethodRenderer,
  ModuleRenderer,
  Overload.MethodRenderer,
  Overload.ConstructorRenderer,
  PropertyRenderer,
  BuiltinRenderer
];
