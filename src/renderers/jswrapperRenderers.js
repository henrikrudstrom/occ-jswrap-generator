const renderers = {};

module.exports.registerRenderer = function registerRenderer(type, fn) {
  renderers[type] = fn;
};

module.exports.createRenderer = function createRenderer(def) {
  var Constructor = renderers[def.type];
  if (Constructor === undefined) throw new Error(`No contructor registred for ${def.type}`);
  return new Constructor(def);
};
