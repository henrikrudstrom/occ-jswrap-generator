const Renderer = require('../renderer.js');

class PropertyRenderer extends Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
  }

  renderMemberDeclarations() {
  }

  renderBeforeOverloadCalls() {
  }

  renderMemberImplementation(parent) {
  }

  renderMemberInitialization(parent) {
  }
}
PropertyRenderer.prototype.declType = 'property';
module.exports = PropertyRenderer;
