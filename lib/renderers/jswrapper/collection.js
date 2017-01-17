const base = require('../base.js');

class CollectionRenderer extends base.Renderer {
  renderIncludeClass() {
    return `#include <common/${this.def.containerType}.h>`;
  }

  renderModuleInitCall() {
    var containedType = this.typemap.getWrappedType(this.def.containedType).def;
    return `${this.def.containerType}<${containedType.qualifiedName}>::Init(target);`;
  }

  // toNative(resVar, inVar, failClause) {
  //   var containedType = this.typemap(this.def.containedType)
  //   return `\
  //     if(!${inVar}->IsArray()) {
  //       ${failClause}
  //     }
  //     auto ${inVar}Array = Nan::To<v8::Array>(${inVar});
  //     for(int i = 0; i < ${inVar}Array->Length(); i++){
  //
  //     }
  //     if(!${inVar}Array->)
  //     else {
  //       ${resVar} = static_cast<${this.def.nativeName}>(Nan::To<uint32_t>(${inVar}).FromJust());
  //     }`;
  // }

  toNative(resVar, inVar, failClause) {
    return `\
      if(!Util::ConvertWrappedValue<${this.def.nativeName}>(${inVar}, ${resVar})){
        ${failClause}
      }`;
  }

  toJs(inVar) {
    return `${this.def.qualifiedName}::BuildWrapper((void *) &${inVar})`;
  }
}

CollectionRenderer.prototype.declType = 'collection';

module.exports = CollectionRenderer;
