const base = require('../base.js');

class ClassRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = def.getAllMembers().map(member => factory.create(member));
  }

  renderMain(content) {
    if (!this.def.isAbstract)
      content[`[spec]/${this.def.relativePath}.js`] = this.renderSuite();
    return super.renderMain(content);
  }

  renderSuite() {
    var imports = this.def.parent.getDependencies()
      .concat([this.def.parent])
      .map(dep => `const ${dep.name} = require('../../lib/${this.def.parent.name}.js');`);
    return `\n
const chai = require('chai');
const expect = chai.expect;

var lib = require('../lib');
${imports.join('\n')}

describe('${this.def.name}', () => {
  var subject;
  beforeEach(() => {
    subject = ${this.renderDefaultConstructor()}
  });

  ${this.emit('renderSpec').join('\n\n')}
});`;
  }

  renderDefaultConstructor() {
    if (this.def.isAbstract) return '\'abstract\'';
    var ctor = this.renderers
      .filter(renderer => renderer.def.declType === 'constructor')[0]
    var defaultOverload = ctor.renderers.sort((a, b) => b.def.arguments.length - a.def.arguments.length)[0];

    return defaultOverload.renderCall();

  }

  renderNewValue() {
    return this.renderDefaultConstructor();
  }
}
ClassRenderer.prototype.declType = 'class';

class BuiltinRenderer extends base.Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.__nextNumber = -1;
  }

  nextInt() {
    this.__nextNumber += 1;
    return this.__nextNumber;
  }

  renderNewValue() {
    if (this.def.name === 'Number') return this.nextInt().toString();
    return 'true';
  }
}
BuiltinRenderer.prototype.declType = 'builtin';

module.exports = { ClassRenderer, BuiltinRenderer };
