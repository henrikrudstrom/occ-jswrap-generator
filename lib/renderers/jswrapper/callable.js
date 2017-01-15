const base = require('../base.js');

class CallableRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = def.overloads.map(overload => factory.create(overload));
  }

  containerMixinGetChildren() {
    return this.overloads;
  }

  renderMemberDeclarations() {
    return `\
      ${this.emit('renderMemberDeclarations').join('\n')}
      static ${this.nanMacro}(${this.def.name});`;
  }

  renderMethodBody() {
    return `\
    ${this.emit('renderOverloadCalls').join('\n')}
    Nan::ThrowError("Argument exception.");`;
  }

  renderMemberImplementation() {
    return `\
      ${this.emit('renderOverloadFunctions').join('\n')}

      ${this.nanMacro}(${this.def.parent.qualifiedName}::${this.def.name}) {
        ${this.renderMethodBody()}
      }`;
  }
}


class MethodRenderer extends CallableRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanMacro = 'NAN_METHOD';
  }

  renderMemberInitialization() {
    return `Nan::SetPrototypeMethod(ctor, "${this.def.name}", ${this.def.name});`;
  }
}
MethodRenderer.prototype.declType = 'method';


class ConstructorRenderer extends MethodRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nativeName = def.parent.name;
    this.renderers = def.overloads.map(overload => factory.create(overload, typemap));
  }

  renderMemberDeclarations() {
    return `\
      static bool firstCall;

      ${super.renderMemberDeclarations()}`;
  }

  renderMemberImplementation() {
    return `\
      bool ${this.def.parent.qualifiedName}::firstCall = true;
      ${super.renderMemberImplementation()}`;
  }

  renderMemberInitialization() {
    return '';
  }

  renderMethodBody() {
    if (this.def.overloads.length === 0) return '';
    var cls = this.def.parent;
    var nativeClassType = cls.hasHandle ? `opencascade::handle<${cls.nativeName}>` : cls.nativeName;
    return `\
      if (!info.IsConstructCall()) {
        std::vector<v8::Local<v8::Value> > args(info.Length());
        for (std::size_t i = 0; i < args.size(); ++i) args[i] = info[i];
        auto inst = Nan::NewInstance(info.Callee(), args.size(), args.data());
        if (!inst.IsEmpty()) info.GetReturnValue().Set(inst.ToLocalChecked());
        return;
      }
      if(firstCall){
        auto wrapper = new ${cls.name}();
        wrapper->Wrap(info.This());
        firstCall = false;
        return;
      }
      if(info.Length() == 1 && info[0]->IsExternal()){
        auto ext = info[0].As<v8::External>()->Value();
        auto wrapper = new ${cls.name}(*static_cast<${nativeClassType} *>(ext));
        wrapper->Wrap(info.This());
        return;
      }


      ${super.renderMethodBody()}`;
  }
}
ConstructorRenderer.prototype.declType = 'constructor';


class GetterRenderer extends CallableRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanMacro = 'NAN_GETTER';
  }

  renderMemberInitialization() {
    var setterArg = this.def.setterName ? `, ${this.def.setterName}` : '';
    return `Nan::SetAccessor(ctorInst, Nan::New("${this.def.name}").ToLocalChecked(), ${this.def.name}${setterArg});`;
  }
}
GetterRenderer.prototype.declType = 'getter';


class SetterRenderer extends CallableRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanMacro = 'NAN_SETTER';
  }
}
SetterRenderer.prototype.declType = 'setter';
module.exports = { MethodRenderer, ConstructorRenderer, GetterRenderer, SetterRenderer };
