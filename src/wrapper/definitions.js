const types = {};
module.exports.register = function register(type, fn) {
  types[type] = fn;
};

module.exports.create = function create(wrappedAPI, parent, conf) {
  var Constructor = types[conf.declType];
  if (Constructor === undefined) throw new Error(`No contructor registred for ${conf.declType}`);
  return new Constructor(wrappedAPI, parent, conf);
};
