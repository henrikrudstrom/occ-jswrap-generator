'use strict'
const Renderer = require('../renderer.js');
const factory = require('../../factory.js');

class OverloadRenderer extends Renderer {
  static getWrappedObject(cls, wrapperVar) {
    if (cls.hasHandle)
      return `opencascade::handle<${cls.nativeClass.name}>::DownCast(${wrapperVar}->wrappedObject)`;
    return `${wrapperVar}->wrappedObject`;
  }

  toJsValue(nativeType, variable) {
    if (nativeType === 'Standard_Real' ||
      nativeType === 'Standard_Boolean' ||
      nativeType === 'Standard_Boolean')
      return `Nan::New(${variable});`;

    var wrappedType = this.def.wrapperAPI.getWrappedType(nativeType);

    if (wrappedType === undefined)
      throw new Error(`dont know how to convert ${nativeType} to js value`);

    return `${wrappedType.qualifiedName}::BuildWrapper((void *) &${variable});`;
  }

  fromJsValue(nativeType, resVar, inVar, failClause) {
    var wrappedType = this.def.wrapperAPI.getWrappedType(nativeType);

    if (wrappedType === undefined)
      throw new Error(`dont know how to convert from js value to '${nativeType}'`);

    var type = wrappedType.classKey;

    var typeDecl = type;
    var convertFunction = `Util::ConvertWrappedValue<${type}>`;
    if (wrappedType.hasHandle) {
      typeDecl = `opencascade::handle<${type}>`;
      convertFunction = `Util::ConvertWrappedTransientValue<${type}>`;
    }
    return `\
      ${typeDecl} ${resVar};
      if(!${convertFunction}(${inVar}, ${resVar})){
        ${failClause}
      }`;
  }

  static overloadName(cls, method, index) {
    return `${cls.parent.name}_${cls.nativeClass.name}_${method.cppName}Overload${index}`;
  }

  callConstructor(args) {
    return `return new ${this.def.nativeMethod.name}(${args});`;
  }

  callMethod(cls, args) {
    var returns = this.def.returnType !== 'void' ? 'return' : '';
    return `\
      auto wrapped = Nan::ObjectWrap::Unwrap<${cls.qualifiedName}>(info.Holder());
      auto obj = ${this.getWrappedObject(cls, 'wrapped')};
      ${returns} obj${cls.dotOrArrow}${this.def.nativeMethod.name}(${args});`;
  }

  renderOverloadFunctions(cls, method, index) {
    var nativeMethod = this.def.nativeMethod;
    var isConstructor = method.declType === 'constructor';
    var args = nativeMethod.arguments.map((arg, i) => 'arg' + i).join(', ');
    var returnType = isConstructor ? `${cls.classKey} *` : method.returnType;
    var overloadName = this.overloadName(cls, method, index);

    var argValues = nativeMethod.arguments.map((arg, i) =>
      this.fromJsValue(arg.type, 'arg' + i, `info[${i}]`, 'return NULL;')
    ).join('\n  ');

    return `\
      ${returnType} ${overloadName}(const Nan::FunctionCallbackInfo<v8::Value>& info){
        if(info.Length() != ${nativeMethod.arguments.length}) return NULL;

        ${argValues}

        ${isConstructor ? this.callConstructor(args) : this.callMethod(cls, args)}
      }`;
  }

  renderOverloadCalls(cls, method, index) {
    var overloadName = this.overloadName(cls, method, index);
    
    var assignReturnValue = isVoid ? '' : `\
    auto val = ${toJsValue(wrapperAPI, nativeMethod.returnType, 'result')}
    info.GetReturnValue().Set(val);`;

    return `\
      res = ${overloadName}(info);
      if(res != NULL) {
        auto wrapper = new ${cls.name}(res);
        wrapper->Wrap(info.This());
        return;
      }`

  }
}

factory.registerRenderer('overload', OverloadRenderer);
