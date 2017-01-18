const util = require('../util.js');

module.exports = util.importAll(
  require('./builtin.js'),
  require('./class.js'),
  require('./callable.js'),
  require('./module.js'),
  require('./overload.js'),
  require('./wrapper.js'),
  require('./collection.js'),
  require('./builder.js'),
  require('./enum.js')
);

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);
