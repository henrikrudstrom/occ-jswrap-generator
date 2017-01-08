const base = require('../base.js');

class BuiltinRenderer extends base.Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nativeTypeDecl = this.def.nativeName;
  }

  toNative(resVar, inVar, failClause) {
    return `\
      if(!Util::ConvertWrappedValue<${this.def.nativeName}>(${inVar}, ${resVar})){
        ${failClause}
      }`;
  }

  toJs(inVar) {
    return `Nan::New(${inVar})`;
  }
}
BuiltinRenderer.prototype.declType = 'builtin';

module.exports = BuiltinRenderer;
