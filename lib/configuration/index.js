const Builtin = require('./builtin.js');
const Class = require('./class.js');
const callable = require('./callable.js');
const Module = require('./module.js');
const Overload = require('./overload.js');
const Wrapper = require('./wrapper.js');
const Collection = require('./collection.js');
const Builder = require('./builder.js');
const Enum = require('./enum.js');

module.exports = {
  Builtin,
  Class,
  Method: callable.MethodConfiguration,
  Constructor: callable.ConstructorConfiguration,
  Getter: callable.GetterConfiguration,
  Setter: callable.SetterConfiguration,
  Collection,
  Module,
  Overload,
  Wrapper,
  Builder,
  Enum
};

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);
