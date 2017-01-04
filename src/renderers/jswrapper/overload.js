'use strict'
const Renderer = require('../renderer.js');
const factory = require('../../factory.js');

class OverloadRenderer extends Renderer {
  static overloadName(cls, method, index) {
    return `${cls.parent.name}_${cls.nativeClass.name}_${method.cppName}Overload${index}`;
  }

  renderNativeCall(cls, args) {
    var returns = this.def.returnType !== 'void' ? 'return' : '';
    return `\
      auto wrapped = Nan::ObjectWrap::Unwrap<${cls.qualifiedName}>(info.Holder());
      auto obj = ${this.getWrappedObject(cls, 'wrapped')};
      ${returns} obj${cls.dotOrArrow}${this.def.nativeMethod.name}(${args});`;
  }

  renderOverloadFunctions(cls, method, index) {
    var nativeMethod = this.def.nativeMethod;
    var args = nativeMethod.arguments.map((arg, i) => 'arg' + i).join(', ');
    var overloadName = this.overloadName(cls, method, index);
    
    var argValues = nativeMethod.arguments.map((arg, i) =>
      this.fromJsValue(arg.type, 'arg' + i, `info[${i}]`, 'return NULL;')
    ).join('\n  ');

    return `\
      ${this.overloadReturnType} ${overloadName}(const Nan::FunctionCallbackInfo<v8::Value>& info, bool & success){
        if(info.Length() != ${nativeMethod.arguments.length}) {
          success = false;
          return NULL;
        }

        ${argValues}

        ${this.RenderNativeCall(cls, args)}
      }`;
  }
  
  renderReturnValueAssignment(){
    return this.def.nativeMethod.returType === 'void' ? '' : `\
      auto val = ${this.toJsValue(this.wrapperAPI, this.def.nativeMethod.returnType, 'res')}
      info.GetReturnValue().Set(val);`;
  }

  renderOverloadCalls(cls, method, index) {
    return `\
      bool success;
      res = ${this.overloadName(cls, method, index)}(info, success);
      if(success) {
        ${this.renderReturnValueAssignment(cls)}
        return;
      }`;
  }
}


class ConstructorOverloadRenderer extends OverloadRenderer {
  callConstructor(args) {
    return `return new ${this.def.nativeMethod.name}(${args});`;
  }
  renderReturnValueAssignment(cls) {
    return `\
      auto wrapper = new ${cls.name}(res);
      wrapper->Wrap(info.This());`;
  }
  
}


factory.registerRenderer('overload', OverloadRenderer);
