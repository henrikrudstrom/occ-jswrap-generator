'use strict'
const upperCamelCase = require('uppercamelcase');


class Renderer {
  emit(part, context) {
    var fnName = `render${upperCamelCase(part)}`;
    return this.renderers
      .filter(rend => typeof (rend[fnName]) === 'function')
      .map(rend => rend[fnName](context));
  }

  renderMain(parent, files) {
    if (!this.renderers) return;
    this.renderers.forEach(renderer => renderer.renderMain(this));
  }
}

module.exports = Renderer;
