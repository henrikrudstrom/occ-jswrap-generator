const ClassRenderer = require('./class.js');

class CollectionRenderer extends ClassRenderer {
  renderEmptyCtorImplementation() {
    return `${this.def.qualifiedName}::${this.def.name}() : wrappedObject(0, 1) {}`;
  }
}

CollectionRenderer.prototype.declType = 'collection';

module.exports = CollectionRenderer;
