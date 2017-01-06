const Renderer = require('../../src/renderers/renderer.js');

class WrapperRenderer extends Renderer {
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

class ModuleRenderer extends Renderer {
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

class ClassRenderer extends Renderer {
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

class MethodRenderer extends Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = def.overloads.map(overload => factory.create(overload, typemap));
  }

  renderMemberImpl(parent) {
    return `${parent.def.name}::${this.def.name} { ${this.emit('call').join(',')} }`;
  }
}

class MethodOverloadRenderer extends Renderer {
  renderCall() {
    return 'methodCall';
  }
}

class ConstructorOverloadRenderer extends Renderer {
  renderCall() {
    return 'constructorCall';
  }
}

class ConstructorRenderer extends MethodRenderer {
  renderMemberImpl(parent) {
    return `${parent.def.name}::Constructor { ${this.emit('call').join(',')} }`;
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
ConstructorRenderer.prototype.type = 'constructor';
MethodOverloadRenderer.prototype.type = 'methodOverload';
ConstructorOverloadRenderer.prototype.type = 'constructorOverload';
BuiltinRenderer.prototype.type = 'builtin';

module.exports = [WrapperRenderer, ModuleRenderer,
  ClassRenderer, MethodRenderer, BuiltinRenderer, ConstructorRenderer,
  ConstructorOverloadRenderer, MethodOverloadRenderer];
