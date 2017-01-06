const Renderer = require('../../src/renderers/renderer.js');

class WrapperRenderer extends Renderer {
  constructor(def, factory, typemap) {
    super();
    this.def = def;
    this.typemap = typemap;
    this.renderers = def.members.map(mod => factory.create(mod, typemap));
  }

  renderMain(files, parent) {
    files = files || {};
    files['./makefile'] = 'dummy makefile content';
    return super.renderMain(files, parent);
  }
}

class ModuleRenderer extends Renderer {
  constructor(def, factory, typemap) {
    super();
    this.def = def;
    this.renderers = def.members.map(mod => factory.create(mod, typemap));
  }

  renderMain(files, parent) {
    files[`src/${this.def.name}.cc`] = `\
init {
  ${this.emit('moduleInit').join('\n')}
}`;
return super.renderMain(files, parent);
  }
}

class ClassRenderer extends Renderer {
  constructor(def, factory, typemap) {
    super();
    this.def = def;
    this.renderers = def.members.map(mod => factory.create(mod, typemap));
  }

  static register() {
    return 'class';
  }

  renderMain(files, parent) {
    files[`src/${this.def.name}.cc`] = `\
implementation {
  ${this.emit('memberImpl').join('\n')}
}`;

  return super.renderMain(files, parent);
  }

  renderModuleInit() {
    return `${this.def.name}::init()`;
  }
}

class MethodRenderer extends Renderer {
  constructor(def) {
    super();
    this.def = def;
  }

  renderMemberImpl(parent) {
    return `${parent.def.name}::${this.def.name} { ... }`;
  }
}

class BuiltinRenderer extends Renderer {
  constructor(def) {
    super();
    this.def = def;
  }
}

WrapperRenderer.prototype.type = 'wrapper';
ModuleRenderer.prototype.type = 'module';
ClassRenderer.prototype.type = 'class';
MethodRenderer.prototype.type = 'method';
BuiltinRenderer.prototype.type = 'builtin';

module.exports = [WrapperRenderer, ModuleRenderer,
  ClassRenderer, MethodRenderer, BuiltinRenderer];
