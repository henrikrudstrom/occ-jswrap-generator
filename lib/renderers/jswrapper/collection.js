const base = require('../base.js');

class CollectionRenderer extends base.Renderer {
  renderIncludeClass() {
    return `#include <common/${this.def.containerType}.h>`;
  }

  renderModuleInitCall() {
    var containedType = this.typemap.getWrappedType(this.def.containedType).def;
    return `${this.def.containerType}<${containedType.qualifiedName}>::Init(target);`;
  }
}

CollectionRenderer.prototype.declType = 'collection';

module.exports = CollectionRenderer;
