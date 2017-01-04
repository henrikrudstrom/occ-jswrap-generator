const upperCamelCase = require('uppercamelcase');

class Renderer {
  emit(part, context) {
    var fnName = `render${upperCamelCase(part)}`;
    return this.renderers
      .filter(rend => typeof (rend[fnName]) === 'function')
      .map(rend => rend[fnName](this, context));
  }

  renderMain(files) {
    if (!this.renderers) return;
    this.renderers.forEach(renderer => renderer.renderMain(files, this));
  }
}

module.exports = Renderer;
