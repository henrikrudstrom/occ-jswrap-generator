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

  renderReturnSingleValue(expr) {
    return `info.GetReturnValue().Set(${expr});`;
  }
  renderReturnMultipleValues(exprs) {
    var setValues = exprs.map(expr => `returnValue->Set(Nan::GetCurrentContext(),
      Nan::New("${expr.name}").ToLocalChecked(), ${expr.value});`);
    return `\
      auto returnValue = Nan::New<v8::Object>();
      ${setValues.join('\n')}
      info.GetReturnValue().Set(returnValue);`;
  }


  renderReturnValueAssignment(resultVar) {
    var returnType = this.def.nativeMethod.returnType;
    var outArgs = this.def.getOutputArguments();

    if (returnType === 'void' && outArgs.length === 0)
      return '';

    if (returnType !== 'void' && outArgs.length === 0)
      return this.renderReturnSingleValue(
        this.typemap.getWrappedType(returnType).toJs(resultVar));

    if (returnType === 'void' && outArgs.length === 1)
      return this.renderReturnSingleValue(
        this.typemap.getWrappedType(outArgs[0].type).toJs('arg' + outArgs[0].name));

    var exprs = outArgs.map(arg => ({
      name: arg.name,
      value: this.typemap.getWrappedType(arg.type).toJs('arg' + arg.name)
    }));

    if (returnType !== 'void')
      exprs.push({
        name: 'return',
        value: this.typemap.getWrappedType(returnType).toJs(resultVar)
      });

    return this.renderReturnMultipleValues(exprs);
  }

  renderOutArgReturnValueAssignment(resultVar) {
    var setValues = this.def.getOutputArguments().map((arg) => {
      var wrappedArgValue = this.typemap.getWrappedType(arg.type).toJs(resultVar);
      return `returnValue->Set(Nan::GetCurrentContext(),
        Nan::New("${arg.name}").ToLocalChecked(), ${wrappedArgValue});`;
    });
    return `\
      auto returnValue = Nan::New<v8::Object>();
      ${setValues.join('\n')}
      info.GetReturnValue().Set(returnValue);`;
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
    var nArgs = this.def.getInputArguments().length;
    return `\
      if(${arg}.Length() != ${nArgs}) {
        return false;
      }`;
  }

  renderGetNanArg(index) {
    return `info[${index}]`;
  }

  renderOverloadFunctions() {
    var args = this.def.arguments.map((arg, i) => 'arg' + arg.name).join(', ');

    var argValues = this.def.arguments.map((arg, i) => {
      var wrappedArgType = this.typemap.getWrappedType(arg.type);
      var getArg = !arg.out ? wrappedArgType.toNative('arg' + arg.name, this.renderGetNanArg(i), 'return false;') : '';
      return `${wrappedArgType.nativeTypeDecl} ${'arg' + arg.name}; \n ${getArg}`;
    }).join('\n  ');

    return `\
      bool ${this.overloadName()}(const ${this.nanArgType}& info){
        ${this.renderCheckNanArg('info')}

        ${argValues}

        ${this.renderNativeCall(args)}
        return true;
      }`;
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
