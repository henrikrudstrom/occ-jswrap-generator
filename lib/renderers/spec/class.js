const base = require('../base.js');

class ClassRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = def.getAllMembers().map(member => factory.create(member, this.def));
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
    if (this.def.customBuilder) {
      return `builder.${this.def.name}();`;
    }
    var ctor = this.renderers
      .filter(renderer => renderer.def.declType === 'constructor')[0];
    var defaultOverload = ctor.renderers
      .sort((a, b) => b.def.args.length - a.def.args.length)[0];

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
    this.__nextInt = -1;
    this.__nextDouble = -0.5;
  }

  nextInt() {
    this.__nextInt += 1;
    return this.__nextInt;
  }

  nextDouble() {
    this.__nextDouble += 1;
    return this.__nextDouble;
  }

  renderNewValue() {
    if (this.def.name === 'uint32_t') return this.nextInt().toString();
    if (this.def.name === 'double') return this.nextDouble().toString();
    return 'true';
  }
}
BuiltinRenderer.prototype.declType = 'builtin';

module.exports = { ClassRenderer, BuiltinRenderer };
