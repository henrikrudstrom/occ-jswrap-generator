const upperCamelCase = require('uppercamelcase');
const containerMixin = require('../containerMixin.js');


class Renderer {
  constructor(def, factory, typemap) {
    this.def = def;
    this.typemap = typemap;
  }
  renderMain(content) {
    return content;
  }

}

class ContainerRenderer extends containerMixin(Renderer) {
  emit(fnName, context) {
    return this.renderers
      .filter(renderer => !renderer.def.isBuiltIn)
      .filter(renderer => renderer.def.canBeWrapped())
      .filter(rend => typeof (rend[fnName]) === 'function')
      .map(rend => rend[fnName](this, context))
      .map(content => (Array.isArray(content) ? content : [content]))
      .reduce((a, b) => a.concat(b), [])
      .filter(content => content !== undefined && content !== '');
  }

  renderMain(content) {
    if (!content) content = {};
    if (!this.renderers) return content;
    this.renderers
      .filter(renderer => !renderer.def.isBuiltIn)
      .filter(renderer => renderer.def.canBeWrapped())
      .forEach(renderer => renderer.renderMain(content, this));
    return content;
  }

  containerMixinGetChildren() {
    return this.renderers;
  }

  containerMixinGetObject(obj) {
    return obj.def;
  }
}

module.exports = { Renderer, ContainerRenderer };
