const Renderer = require('../renderer.js');

class MethodRenderer extends Renderer {
  constructor(def, factory) {
    super();
    this.def = def;
    this.nativeName = def.overloads[0].nativeMethod.name;
    this.renderers = def.overloads.map(decl => factory.create(decl));
    this.methodName = def.cppName;
  }

  renderMemberDeclarations() {
    return `static NAN_METHOD(${this.methodName});`;
  }

  renderBeforeOverloadCalls() {
    return '';
  }

  renderMemberImplementation(parent) {
    return `\
      ${this.emit('overloadFunctions')}

      NAN_METHOD(${parent.def.qualifiedName}::${this.methodName}) {
        ${this.renderBeforeOverloadCalls};
        ${this.emit('overloadCalls')}
      }`;
  }

  renderMemberInitialization(parent) {
    return `Nan::SetPrototypeMethod(ctor, "${this.def.name}", ${this.methodName});`;
  }
}
