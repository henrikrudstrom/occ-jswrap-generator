const base = require('../../src/renderers/base.js');

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
  ${this.emit('moduleInit').join('\n')}
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
  ${this.emit('memberImpl').join('\n')}
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
    return `${parent.def.name}::${this.def.name} { ${this.emit('call').join(',')} }`;
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
    return `${parent.def.name}::Constructor { ${this.emit('call').join(',')} }`;
  }
}

class BuiltinRenderer extends base.Renderer {
  constructor(def) {
    super();
    this.def = def;
  }
}

WrapperRenderer.prototype.type = 'wrapper';
ModuleRenderer.prototype.type = 'module';
ClassRenderer.prototype.type = 'class';
MethodRenderer.prototype.type = 'method';
ConstructorRenderer.prototype.type = 'constructor';
MethodOverloadRenderer.prototype.type = 'methodOverload';
ConstructorOverloadRenderer.prototype.type = 'constructorOverload';
BuiltinRenderer.prototype.type = 'builtin';

module.exports = [WrapperRenderer, ModuleRenderer,
  ClassRenderer, MethodRenderer, BuiltinRenderer, ConstructorRenderer,
  ConstructorOverloadRenderer, MethodOverloadRenderer];
