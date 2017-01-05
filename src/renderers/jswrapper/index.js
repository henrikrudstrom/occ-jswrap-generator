const ClassRenderer = require('./class.js');
const ConstructorRenderer = require('./constructor.js');
const MethodRenderer = require('./method.js');
const ModuleRenderer = require('./module.js');
const OverloadRenderer = require('./overload.js');
const PropertyRenderer = require('./property.js');
const TypeRenderer = require('./type.js');
const WrapperRenderer = require('./wrapper.js');

module.exports = [
  ClassRenderer,
  ConstructorRenderer,
  MethodRenderer,
  ModuleRenderer,
  OverloadRenderer,
  PropertyRenderer,
  TypeRenderer
];
