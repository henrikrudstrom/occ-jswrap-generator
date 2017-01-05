const BuiltinDefinition = require('./builtin.js');
const ClassDefinition = require('./class.js');
const ConstructorDefinition = require('./constructor.js');
const MethodDefinition = require('./method.js');
const ModuleDefinition = require('./module.js');
const OverloadDefinition = require('./methodOverload.js');
const PropertyDefinition = require('./property.js');
const WrapperDefinition = require('./wrapper.js');

module.exports = [
  BuiltinDefinition,
  ClassDefinition,
  ConstructorDefinition,
  MethodDefinition,
  ModuleDefinition,
  OverloadDefinition,
  PropertyDefinition,
  WrapperDefinition
];
