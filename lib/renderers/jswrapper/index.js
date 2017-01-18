const Factory = require('../../factory.js');
const typemap = require('../../typemap.js');
const util = require('../../util.js');

module.exports = util.importAll(
  require('./class.js'),
  require('./module.js'),
  require('./overload.js'),
  require('./builtin.js'),
  require('./wrapper.js'),
  require('./collection.js'),
  require('./callable.js'),
  require('./builder.js'),
  require('./enum.js')
);

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);

module.exports.create = function create(model) {
  return new Factory(module.exports.all, new typemap.Renderer()).create(model);
};
