'use strict'
const Renderer = require('../renderer.js');

class MethodRenderer extends Renderer {
  constructor(def) {
    super();
    this.def = def;
    this.nativeName = def.overloads[0].nativeMethod.name;
  }

  renderMemberDeclarations() {
    return `static NAN_METHOD(${this.cppName});`;
  }

  renderMemberImplementation() {
    return `\
      ${overloadFunctions}

      NAN_METHOD(${cls.qualifiedName}::${method.cppName}) {
        ${overloadCalls}
      }`;
  }
}
