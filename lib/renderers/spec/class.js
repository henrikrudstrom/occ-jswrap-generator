const base = require('../base.js');

class ClassRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = []; // def.members.map(member => factory.create(member));
  }

  renderMain(content) {
    console.log("RENDER")
    content[`[spec]/${this.def.relativePath}.js`] = this.renderSuite();
    return super.renderMain(content);
  }

  renderSuite() {
    var imports = this.def.getWrappedDependencies()
      .map(dep => `const ${dep.name} = require('../../lib/${this.def.relativePath}.js');`);
    return `\
      ${imports.join('\n')}

      describe('${this.def.name}', () => {
        ${this.emit('renderSpec')}
      });`;
  }
}
ClassRenderer.prototype.declType = 'class';

module.exports = ClassRenderer;
