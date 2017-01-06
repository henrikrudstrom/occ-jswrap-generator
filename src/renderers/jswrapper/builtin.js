const Renderer = require('../renderer.js');

class BuiltinRenderer extends Renderer {
  toNative(resVar, inVar, failClause) {
    return `\
      ${this.def.nativeName} ${resVar};
      if(!Util::ConvertWrappedValue<${this.def.nativeName}>(${inVar}, ${resVar})){
        ${failClause}
      }`;
  }

  toJs(inVar) {
    return `Nan::New(${inVar});`;
  }
}
BuiltinRenderer.prototype.type = 'builtin';

module.exports = BuiltinRenderer;
