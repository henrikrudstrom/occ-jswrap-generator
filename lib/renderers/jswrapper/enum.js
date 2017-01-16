const base = require('../base.js');

class EnumRenderer extends base.Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nativeTypeDecl = this.def.nativeName;
  }

  renderIncludeClass() {
    return `#include <${this.def.nativeName}.hxx>`;
  }

  renderModuleBody() {
    var values = this.def.values
      .map(val => `enumObj->ForceSet(Nan::New("${val.name}").ToLocalChecked(), Nan::New(${val.value}), v8::ReadOnly);`);
    return `\
    void CreateEnum${this.def.name}(v8::Handle<v8::Object> target){
      auto enumObj = Nan::New<v8::Object>();
      ${values.join('\n')}
      target->ForceSet(Nan::New("${this.def.name}").ToLocalChecked(), enumObj, v8::ReadOnly);
    }`;
  }

  renderModuleInitCall() {
    return `CreateEnum${this.def.name}(target);`;
  }

  toNative(resVar, inVar, failClause) {
    return `\
      if(${inVar}->IsNumber()) {
        ${resVar} = static_cast<${this.def.nativeName}>(Nan::To<uint32_t>(${inVar}).FromJust());
      }
      else {
        ${failClause}
      }`;
  }

  toJs(inVar) {
    return `Nan::New(static_cast<uint32_t>(${inVar}))`;
  }
}

EnumRenderer.prototype.declType = 'enum';

module.exports = EnumRenderer;
