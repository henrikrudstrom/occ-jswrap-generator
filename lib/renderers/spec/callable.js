const base = require('../base.js');

class CallableRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap, parentDef) {
    super(def, factory, typemap);
    this.renderers = def.overloads.map(overload => factory.create(overload, parentDef));
  }
  renderSpec() {
    return this.emit('renderSpec').join('\n\n');
  }
  

}
CallableRenderer.prototype.declType = ['constructor', 'method', 'getter', 'setter']

module.exports = CallableRenderer;