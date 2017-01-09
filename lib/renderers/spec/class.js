const base = require('../base.js');

class ClassRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = def.members.map(member => factory.create(member));
  }

  renderMain(content) {
    content[`[spec]/${this.def.relativePath}.js`] = this.renderSuite();
    return super.renderMain(content);
  }

  renderSuite() {
    var imports = this.def.parent.getDependencies()
      .concat([this.def.parent])
      .map(dep => `const ${dep.name} = require('../../lib/${this.def.relativePath}.js');`);
    return `${imports.join('\n')}

      describe('${this.def.name}', () => {
        ${this.emit('renderSpec').join('\n')}
      });`;
  }
}
ClassRenderer.prototype.declType = 'class';

class BuiltinRenderer extends base.Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
  }
}
BuiltinRenderer.prototype.declType = 'builtin';

module.exports = { ClassRenderer, BuiltinRenderer };
