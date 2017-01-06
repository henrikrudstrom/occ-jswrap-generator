const Builtin = require('./builtin.js');
const Class = require('./class.js');
const Constructor = require('./constructor.js');
const Method = require('./method.js');
const Module = require('./module.js');
const Overload = require('./methodOverload.js');
const Property = require('./property.js');
const Wrapper = require('./wrapper.js');

module.exports = {
  Builtin,
  Class,
  Constructor,
  Method,
  Module,
  Overload,
  Property,
  Wrapper
};

module.exports.all = Object.values(module.exports);