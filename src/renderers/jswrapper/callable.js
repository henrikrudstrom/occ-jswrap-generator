const base = require('../base.js');

class CallableRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nativeName = def.overloads[0].nativeMethod.name;
    this.renderers = def.overloads.map(overload => factory.create(overload, typemap));
    this.methodName = def.cppName;
  }

  containerMixinGetChildren() {
    return this.overloads;
  }

  renderMemberDeclarations() {
    return `static ${this.nanMacro}(${this.methodName});`;
  }

  renderMethodBody() {
    return `\
    ${this.emit('overloadCalls').join('\n')}`;
  }

  renderMemberImplementation() {
    return `\
      ${this.emit('overloadFunctions').join('\n')}

      ${this.nanMacro}(${this.def.parent.qualifiedName}::${this.methodName}) {
        ${this.renderMethodBody()};
      }`;
  }
}


class MethodRenderer extends CallableRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanMacro = 'NAN_METHOD';
  }

  renderMemberInitialization() {
    return `Nan::SetPrototypeMethod(ctor, "${this.def.name}", ${this.methodName});`;
  }
}
MethodRenderer.prototype.type = 'method';


class ConstructorRenderer extends MethodRenderer {
  renderMemberDeclarations() {
    return `\
      static bool firstCall;

      static NAN_METHOD(New);`;
  }

  renderMemberImplementation() {
    return `\
      bool ${this.def.parent.qualifiedName}::firstCall = true;
      ${super.renderMemberImplementation()}`;
  }

  renderMethodBody() {
    return `\
      if (!info.IsConstructCall()) {
        std::vector<v8::Local<v8::Value> > args(info.Length());
        for (std::size_t i = 0; i < args.size(); ++i) args[i] = info[i];
        auto inst = Nan::NewInstance(info.Callee(), args.size(), args.data());
        if (!inst.IsEmpty()) info.GetReturnValue().Set(inst.ToLocalChecked());
        return;
      }
      if(firstCall){
        auto wrapper = new ${this.def.parent.name}();
        wrapper->Wrap(info.This());
        firstCall = false;
        return;
      }
      ${super.renderMethodBody()}`;
  }
}
ConstructorRenderer.prototype.type = 'constructor';


class GetterRenderer extends CallableRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanMacro = 'NAN_GETTER';
  }

  renderMemberInitialization() {
    var setterArg = this.setterName ? `, ${this.setterName}` : '';
    return `Nan::SetAccessor(ctorInst, "${this.def.name}", ${this.name}${setterArg});`;
  }
}
GetterRenderer.prototype.type = 'getter';


class SetterRenderer extends CallableRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanMacro = 'NAN_SETTER';
  }
}
SetterRenderer.prototype.type = 'setter';
module.exports = { MethodRenderer, ConstructorRenderer, GetterRenderer, SetterRenderer };
