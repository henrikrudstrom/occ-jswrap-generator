const Renderer = require('../renderer.js');

class MethodOverloadRenderer extends Renderer {
  parentClass() {
    return this.def.parent.parent;
  }

  getWrappedObject(wrapperVar) {
    if (this.parentClass().hasHandle)
      return `opencascade::handle<${this.parentClass().nativeClass.name}>::DownCast(${wrapperVar}->wrappedObject)`;
    return `${wrapperVar}->wrappedObject`;
  }

  overloadName() {
    var baseName = this.parentClass().qualifiedName.replace('::', '_');
    return `${baseName}_${this.def.parent.cppName}Overload${this.def.index}`;
  }

  renderNativeCall(args) {
    var cls = this.parentClass();
    var returns = this.def.returnType !== 'void' ? 'return' : '';
    return `\
      auto wrapped = Nan::ObjectWrap::Unwrap<${cls.qualifiedName}>(info.Holder());
      auto obj = ${this.getWrappedObject('wrapped')};
      ${returns} obj${cls.dotOrArrow}${this.def.nativeMethod.name}(${args});`;
  }

  renderOverloadFunctions() {
    var nativeMethod = this.def.nativeMethod;
    var args = nativeMethod.arguments.map((arg, i) => 'arg' + i).join(', ');
    var overloadName = this.overloadName();

    var argValues = nativeMethod.arguments.map((arg, i) => {
      return this.typemap
        .getWrappedType(arg.type)
        .toNative('arg' + i, `info[${i}]`, 'return NULL;');
    }
    ).join('\n  ');
    console.log(this.def.name, this.def.type)
    return `\
      ${this.def.returnType} ${overloadName}(const Nan::FunctionCallbackInfo<v8::Value>& info, bool & success){
        if(info.Length() != ${nativeMethod.arguments.length}) {
          success = false;
          return NULL;
        }

        ${argValues}

        ${this.renderNativeCall(args)}
      }`;
  }

  renderReturnValueAssignment() {
    var returnType = this.def.nativeMethod.returnType;
    return returnType === 'void' ? '' : `\
      auto val = ${this.typemap.getWrappedType(returnType).toJs('res')}
      info.GetReturnValue().Set(val);`;
  }

  renderOverloadCalls() {
    return `\
      bool success;
      res = ${this.overloadName(this.def.index)}(info, success);
      if(success) {
        ${this.renderReturnValueAssignment()}
        return;
      }`;
  }
}
MethodOverloadRenderer.prototype.type = 'methodOverload';

class ConstructorOverloadRenderer extends MethodOverloadRenderer {
  callConstructor(args) {
    return `return new ${this.def.nativeMethod.name}(${args});`;
  }
  renderReturnValueAssignment() {
    return `\
      auto wrapper = new ${this.parentClass().name}(res);
      wrapper->Wrap(info.This());`;
  }
}
ConstructorOverloadRenderer.prototype.type = 'constructorOverload';

module.exports = {
  ConstructorRenderer: ConstructorOverloadRenderer,
  MethodRenderer: MethodOverloadRenderer
};
