const base = require('../base.js');

class BuiltinRenderer extends base.Renderer {
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
BuiltinRenderer.prototype.declType = 'builtin';

module.exports = BuiltinRenderer;
