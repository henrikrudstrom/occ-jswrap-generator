const upperCamelCase = require('uppercamelcase');

class Renderer {
  constructor(def, factory, typemap) {
    this.def = def;
    this.typemap = typemap;
  }

  emit(part, context) {
    var fnName = `render${upperCamelCase(part)}`;
    return this.renderers
      .filter(renderer => !renderer.def.isBuiltIn)
      .filter(renderer => renderer.def.canBeWrapped())
      .filter(rend => typeof (rend[fnName]) === 'function')
      .map(rend => rend[fnName](this, context))
      .filter(content => content !== undefined && content !== '');
  }

  renderMain(content) {
    if (!this.renderers) return content;
    this.renderers
        .filter(renderer => !renderer.def.isBuiltIn)
        .filter(renderer => renderer.def.canBeWrapped())
        .forEach(renderer => renderer.renderMain(content, this));
    return content;
  }
}

module.exports = Renderer;
