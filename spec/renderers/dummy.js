const base = require('../../lib/renderers/base.js');

class WrapperRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = def.members.map(mod => factory.create(mod, typemap));
  }

  renderMain(files, parent) {
    files = files || {};
    files['./makefile'] = 'dummy makefile content';
    return super.renderMain(files, parent);
  }
}

class ModuleRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = def.members.map(mod => factory.create(mod, typemap));
  }

  renderMain(files, parent) {
    files[`src/${this.def.name}.cc`] = `\
init {
  ${this.emit('renderModuleInit').join('\n')}
}`;
return super.renderMain(files, parent);
  }
}

class ClassRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = def.members.map(mod => factory.create(mod, typemap));
  }

  static register() {
    return 'class';
  }

  renderMain(files, parent) {
    files[`src/${this.def.name}.cc`] = `\
implementation {
  ${this.emit('renderMemberImpl').join('\n')}
}`;

  return super.renderMain(files, parent);
  }

  renderModuleInit() {
    return `${this.def.name}::init()`;
  }
}

class MethodRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = def.overloads.map(overload => factory.create(overload, typemap));
  }

  containerMixinGetChildren() {
    return this.overloads;
  }

  renderMemberImpl(parent) {
    return `${parent.def.name}::${this.def.name} { ${this.emit('renderCall').join(',')} }`;
  }
}

class MethodOverloadRenderer extends base.Renderer {
  renderCall() {
    return 'methodCall';
  }
}

class ConstructorOverloadRenderer extends base.Renderer {
  renderCall() {
    return 'constructorCall';
  }
}

class ConstructorRenderer extends MethodRenderer {
  renderMemberImpl(parent) {
    return `${parent.def.name}::Constructor { ${this.emit('renderCall').join(',')} }`;
  }
}

class BuiltinRenderer extends base.Renderer {
  constructor(def) {
    super();
    this.def = def;
  }
}

WrapperRenderer.prototype.declType = 'wrapper';
ModuleRenderer.prototype.declType = 'module';
ClassRenderer.prototype.declType = 'class';
MethodRenderer.prototype.declType = 'method';
ConstructorRenderer.prototype.declType = 'constructor';
MethodOverloadRenderer.prototype.declType = 'methodOverload';
ConstructorOverloadRenderer.prototype.declType = 'constructorOverload';
BuiltinRenderer.prototype.declType = 'builtin';

module.exports = [WrapperRenderer, ModuleRenderer,
  ClassRenderer, MethodRenderer, BuiltinRenderer, ConstructorRenderer,
  ConstructorOverloadRenderer, MethodOverloadRenderer];
