const fs = require('fs');
const glob = require('glob');

class RendererFactory {
  constructor() {
    console.log("hmm")
    this.renderers = {};
  }
  register(renderer) {
    if (Array.isArray(renderer))
      renderer.forEach(this.register.bind(this));
    else
      this.renderers[renderer.register()] = renderer;
  }
  create(def) {
    return new this.renderers[def.declType](def, this);
  }
}

module.exports = function render(model, renderers) {
  var factory = new RendererFactory();
  factory.register(renderers);
  var root = factory.create(model);
  var files = {};
  root.renderMain(files);
  return files;
};
