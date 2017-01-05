const BuiltinDefinition = require('./builtin.js').Definition;
const ClassDefinition = require('./class.js').Definition;
const ConstructorDefinition = require('./constructor.js').Definition;
const MethodDefinition = require('./method.js').Definition;
const ModuleDefinition = require('./module.js').Definition;
const OverloadDefinition = require('./methodOverload.js').Definition;
const PropertyDefinition = require('./property.js').Definition;
const WrapperDefinition = require('./wrapper.js').Definition;

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
