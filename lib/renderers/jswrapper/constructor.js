const MethodRenderer = require('./method.js');

class ConstructorRenderer extends MethodRenderer {
  renderMemberDeclarations() {
    return `\
      static bool firstCall;

      static NAN_METHOD(New);`;
  }


  renderMemberImplementation() {
    return `\
      ${this.emit('overloadFunctions').join('\n')}

      bool ${this.def.parent.qualifiedName}::firstCall = true;

      NAN_METHOD(${this.def.parent.qualifiedName}::${this.methodName}) {
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
        ${this.emit('overloadCalls').join('\n')}
      }`;
  }

  renderMemberInitialization() {
    return '';
  }
}
ConstructorRenderer.prototype.declType = 'constructor';
module.exports = ConstructorRenderer;
