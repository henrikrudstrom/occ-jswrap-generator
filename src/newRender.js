const RendererFactory = require('./factory.js').RendererTypemap;

module.exports = function render(model, renderers) {
  var factory = new RendererFactory(renderers);
  var root = factory.create(model);

  var files = {};
  root.renderMain(files);
  return files;
};
