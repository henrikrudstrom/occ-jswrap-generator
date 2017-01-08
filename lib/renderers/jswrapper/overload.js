const base = require('../base.js');

class MethodOverloadRenderer extends base.Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanArgType = 'Nan::FunctionCallbackInfo<v8::Value>';
  }
  parentClass() {
    return this.def.parent.parent;
  }

  returnType() {
    return this.def.returnType;
  }

  getWrappedObject(wrapperVar) {
    if (this.parentClass().hasHandle)
      return `opencascade::handle<${this.parentClass().nativeClass.name}>::DownCast(${wrapperVar}->wrappedObject)`;
    return `${wrapperVar}->wrappedObject`;
  }

  overloadName() {
    return `${this.parentClass().qualifiedName}::${this.def.parent.cppName}Overload${this.def.index}`;
  }
  renderMemberDeclarations() {
    return `static bool ${this.def.parent.cppName}Overload${this.def.index}(const ${this.nanArgType}& info);`;
  }

  renderNativeCall(args) {
    var cls = this.parentClass();
    var returns = this.def.returnType !== 'void' ? 'auto res = ' : '';
    var operator = cls.hasHandle ? '->' : '.';
    return `\
      auto wrapped = Nan::ObjectWrap::Unwrap<${cls.qualifiedName}>(info.Holder());
      auto obj = ${this.getWrappedObject('wrapped')};
      ${returns}obj${operator}${this.def.nativeMethod.name}(${args});
      ${this.renderReturnValueAssignment('res')}`;
  }

  renderCheckNanArg(arg) {
    return `\
      if(${arg}.Length() != ${this.def.nativeMethod.arguments.length}) {
        return false;
      }`;
  }

  renderGetNanArg(index) {
    return `info[${index}]`;
  }

  renderOverloadFunctions() {
    var args = this.def.arguments.map((arg, i) => 'arg' + i).join(', ');

    var argValues = this.def.arguments.map((arg, i) => {
      var argWrapType = this.typemap.getWrappedType(arg.type);
      var getArg = !arg.out ? argWrapType.toNative('arg' + i, this.renderGetNanArg(i), 'return false;') : '';
      return `${argWrapType.nativeTypeDecl} ${'arg' + i}; \n ${getArg}`;
    }).join('\n  ');

    return `\
      bool ${this.overloadName()}(const ${this.nanArgType}& info){
        ${this.renderCheckNanArg('info')}

        ${argValues}

        ${this.renderNativeCall(args)}
        return true;
      }`;
  }


  renderReturnValueAssignment(args) {
    var returnType = this.def.nativeMethod.returnType;
    return returnType === 'void' ? '' : `\
      auto val = ${this.typemap.getWrappedType(returnType).toJs(args)}
      info.GetReturnValue().Set(val);`;
  }

  renderOverloadCalls() {
    return `\
      if(${this.overloadName(this.def.index)}(info)) {
        return;
      }`;
  }
}
MethodOverloadRenderer.prototype.declType = 'methodOverload';

class ConstructorOverloadRenderer extends MethodOverloadRenderer {
  renderReturnValueAssignment(args) {
    return `\
      auto wrapper = new ${this.parentClass().qualifiedName}(${args});
      wrapper->Wrap(info.This());`;
  }
  returnType() {
    return this.parentClass().nativeName;
  }
  renderNativeCall(args) {
    var methodCall = `new ${this.parentClass().nativeName}(${args})`;
    return `\
      ${this.renderReturnValueAssignment(methodCall)}`;
  }

}
ConstructorOverloadRenderer.prototype.declType = 'constructorOverload';

class GetterOverloadRenderer extends MethodOverloadRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanArgType = 'Nan::PropertyCallbackInfo<v8::Value>';
  }
  renderCheckNanArg() {
    return '';
  }
  renderGetNanArg() {
    return '';
  }

}
GetterOverloadRenderer.prototype.declType = 'getterOverload';

class SetterOverloadRenderer extends MethodOverloadRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanArgType = 'Nan::PropertyCallbackInfo<void>';
  }
  renderCheckNanArg() {
    return '';
  }
  renderGetNanArg() {
    return 'info.Data()';
  }

}
SetterOverloadRenderer.prototype.declType = 'setterOverload';

module.exports = {
  ConstructorRenderer: ConstructorOverloadRenderer,
  MethodRenderer: MethodOverloadRenderer,
  GetterRenderer: GetterOverloadRenderer,
  SetterRenderer: SetterOverloadRenderer
};
