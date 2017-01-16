const ClassRenderer = require('./class.js');
const ModuleRenderer = require('./module.js');
const Overload = require('./overload.js');
const BuiltinRenderer = require('./builtin.js');
const WrapperRenderer = require('./wrapper.js');
const CollectionRenderer = require('./collection.js');
const callable = require('./callable.js');
const builder = require('./builder.js');
const Factory = require('../../factory.js');
const typemap = require('../../typemap.js');
const EnumRenderer = require('./enum.js');

module.exports = {
  WrapperRenderer,
  ClassRenderer,
  ModuleRenderer,
  CollectionRenderer,
  MethodRenderer: callable.MethodRenderer,
  ConstructorRenderer: callable.ConstructorRenderer,
  GetterRenderer: callable.GetterRenderer,
  SetterRenderer: callable.SetterRenderer,
  OverloadMethodRenderer: Overload.MethodRenderer,
  OverloadConstructorRenderer: Overload.ConstructorRenderer,
  GetterPropertyRenderer: Overload.GetterRenderer,
  SetterPropertyRenderer: Overload.SetterRenderer,
  BuilderRenderer: builder.BuilderRenderer,
  BuilderOverloadRenderer: builder.BuilderOverloadRenderer,
  BuiltinRenderer,
  EnumRenderer
};

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);

module.exports.create = function create(model) {
  return new Factory(module.exports.all, new typemap.Renderer()).create(model);
};
