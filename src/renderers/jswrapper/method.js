const Renderer = require('../renderer.js');

class MethodRenderer extends Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nativeName = def.overloads[0].nativeMethod.name;
    this.renderers = def.overloads.map(overload => factory.create(overload, typemap));
    this.methodName = def.cppName;
  }

  renderMemberDeclarations() {
    return `static NAN_METHOD(${this.methodName});`;
  }

  renderBeforeOverloadCalls() {
    return '';
  }

  renderMemberImplementation() {
    return `\
      ${this.emit('overloadFunctions').join('\n')}

      NAN_METHOD(${this.def.parent.qualifiedName}::${this.methodName}) {
        ${this.renderBeforeOverloadCalls()};
        ${this.emit('overloadCalls').join('\n')}
      }`;
  }

  renderMemberInitialization() {
    return `Nan::SetPrototypeMethod(ctor, "${this.def.name}", ${this.methodName});`;
  }
}
MethodRenderer.prototype.type = 'method';
module.exports = MethodRenderer;
