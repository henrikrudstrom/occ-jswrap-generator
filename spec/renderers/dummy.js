const Renderer = require('../../src/renderers/renderer.js');

class WrapperRenderer extends Renderer {
  constructor(def, factory) {
    super();
    this.def = def;
    this.renderers = def.members.map(mod => factory.create(mod, factory));
  }

  static register() {
    return 'wrapper';
  }

  renderMain(files, parent) {
    super.renderMain(files, parent);
    files['./makefile'] = 'dummy makefile content';
  }
}

class ModuleRenderer extends Renderer {
  constructor(def, factory) {
    super();
    this.def = def;
    this.renderers = def.members.map(mod => factory.create(mod, factory));
  }

  static register() {
    return 'module';
  }

  renderMain(files, parent) {
    super.renderMain(files, parent);
    files[`src/${this.def.name}.cc`] = `\
init {
  ${this.emit('moduleInit').join('\n')}
}`;
  }
}

class ClassRenderer extends Renderer {
  constructor(def, factory) {
    super();
    this.def = def;
    this.renderers = def.members.map(mod => factory.create(mod, factory));
  }

  static register() {
    return 'class';
  }

  renderModuleInit() {
    return `${this.def.name}::init()`;
  }

  renderMain(files, parent) {
    super.renderMain(files, parent);
    files[`src/${this.def.name}.cc`] = `\
implementation {
  ${this.emit('memberImpl').join('\n')}
}`;
  }
}

class MethodRenderer extends Renderer {
  constructor(def) {
    super();
    this.def = def;
  }

  static register() {
    return 'method';
  }

  renderMemberImpl(parent) {
    return `${parent.def.name}::${this.def.name} { ... }`;
  }
}

module.exports = [WrapperRenderer, ModuleRenderer, ClassRenderer, MethodRenderer];
