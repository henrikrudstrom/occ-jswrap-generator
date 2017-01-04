const definitions = {};
const renderers = {};

module.exports.registerDefinition = function registerDefinition(type, fn) {
  definitions[type] = fn;
};

module.exports.createDefinition = function createDefinition(wrappedAPI, parent, conf) {
  var Constructor = definitions[conf.declType];
  if (Constructor === undefined) throw new Error(`No contructor registred for ${conf.declType}`);
  return new Constructor(wrappedAPI, parent, conf);
};

module.exports.registerRenderer = function registerRenderer(type, fn) {
  renderers[type] = fn;
};

module.exports.createRenderer = function createRenderer(def) {
  var Constructor = renderers[def.declType];
  if (Constructor === undefined) throw new Error(`No contructor registred for ${def.declType}`);
  return new Constructor(def);
};
