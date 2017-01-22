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
    return `${this.parentClass().qualifiedName}::${this.def.parent.name}Overload${this.def.index}`;
  }
  renderMemberDeclarations() {
    return `static bool ${this.def.parent.name}Overload${this.def.index}(${this.getOverloadArgsDecl()});`;
  }

  renderReturnValues(exprs) {
    if (exprs.length === 1)
      return `info.GetReturnValue().Set(${exprs[0].value});`;

    var setValues = exprs.map(expr => `returnValue->Set(Nan::GetCurrentContext(),
      Nan::New("${expr.name}").ToLocalChecked(), ${expr.value});`);
    return `\
      Nan::HandleScope scope;
      auto returnValue = Nan::New<v8::Object>();
      ${setValues.join('\n')}
      info.GetReturnValue().Set(returnValue);`;
  }

  getReturnValueExpressions(resultVar) {
    var returnType = this.def.returnType;
    var outArgs = this.def.getOutputArguments();

    var exprs = outArgs.map(arg => ({
      name: arg.name,
      value: this.typemap.getWrappedType(arg.type).toJs('arg' + arg.name)
    }));

    if (returnType !== 'void')
      exprs.push({
        name: 'return',
        value: this.typemap.getWrappedType(returnType).toJs(resultVar)
      });
    return exprs;
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

  renderGetInstance() {
    return `\
      auto wrapped = Nan::ObjectWrap::Unwrap<${this.parentClass().qualifiedName}>(info.Holder());
      auto obj = ${this.getWrappedObject('wrapped')};
      if(errorHandler.HasCaught()){
        return false;
      }`;
  }

  renderNativeCall(args) {
    var returns = this.def.returnType !== 'void' ? 'auto res = ' : '';
    var operator = this.parentClass().hasHandle ? '->' : '.';
    var returnExprs = this.getReturnValueExpressions('res');
    return `\
      ${returns}obj${operator}${this.def.nativeName}(${args});
      ${this.renderReturnValues(returnExprs)}`;
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

  getArgNames() {
    return this.def.args.map(arg => 'arg' + arg.name);
  }

  getOverloadArgsDecl() {
    return `const ${this.nanArgType}& info`;
  }

  renderOverloadFunctions() {
    var argValues = this.def.args.map((arg, i) => {
      var wrappedArgType = this.typemap.getWrappedType(arg.type);
      var getArg = !arg.out ? wrappedArgType.toNative('arg' + arg.name, this.renderGetNanArg(i), 'return false;') : '';
      return `${wrappedArgType.nativeTypeDecl} ${'arg' + arg.name}; \n ${getArg}`;
    }).join('\n  ');

    return `\
      bool ${this.overloadName()}(${this.getOverloadArgsDecl()}){
        ${this.renderCheckNanArg('info')}
        Nan::TryCatch errorHandler;
        ${argValues}
        if(errorHandler.HasCaught()){
          return false;
        }
        ${this.renderGetInstance()}
        try {
          ${this.renderNativeCall(this.getArgNames().join(', '))}
        }
        catch(...) {
          Nan::ThrowError(Nan::New("Error occured in native call.").ToLocalChecked());
          return true;
        }
        return true;
      }`;
  }

  getOverloadCallArgs() {
    return 'info';
  }

  renderOverloadCalls() {
    return `\
      if(${this.overloadName(this.def.index)}(${this.getOverloadCallArgs()})) {
        return;
      }`;
  }
}
MethodOverloadRenderer.prototype.declType = 'methodOverload';

class ConstructorOverloadRenderer extends MethodOverloadRenderer {
  renderNativeCall(args) {
    var nativeCtorCall = `new ${this.parentClass().nativeName}(${args})`;
    return `\
      auto wrapper = new ${this.parentClass().qualifiedName}(${nativeCtorCall});
      wrapper->Wrap(info.This());`;
  }
  returnType() {
    return this.parentClass().nativeName;
  }

  renderGetInstance() {
    return '';
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


class IndexedGetterOverloadRenderer extends GetterOverloadRenderer {
  getArgNames() {
    return ['index'].concat(super.getArgNames());
  }

  getOverloadArgsDecl() {
    return `uint32_t index, ${super.getOverloadArgsDecl()}`;
  }

  getOverloadCallArgs() {
    return 'index, info';
  }
}
IndexedGetterOverloadRenderer.prototype.declType = 'indexedGetterOverload';

class IndexedSetterOverloadRenderer extends SetterOverloadRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanArgType = 'Nan::PropertyCallbackInfo<v8::Value>';
  }

  getArgNames() {
    return ['index'].concat(super.getArgNames());
  }

  getOverloadArgsDecl() {
    return `uint32_t index, v8::Local<v8::Value> value, ${super.getOverloadArgsDecl()}`;
  }

  getOverloadCallArgs() {
    return 'index, value, info';
  }

  renderGetNanArg() {
    return 'value';
  }
}
IndexedSetterOverloadRenderer.prototype.declType = 'indexedSetterOverload';


module.exports = {
  ConstructorRenderer: ConstructorOverloadRenderer,
  MethodRenderer: MethodOverloadRenderer,
  GetterRenderer: GetterOverloadRenderer,
  SetterRenderer: SetterOverloadRenderer,
  IndexedGetterRenderer: IndexedGetterOverloadRenderer,
  IndexedSetterRenderer: IndexedSetterOverloadRenderer
};
