'use strict'
const MethodRenderer = require('./method.js');

class ConstructorRenderer extends MethodRenderer {
  constructor(def) {
    super(def);
  }

  renderMemberDeclarations() {
    return `\
      static bool firstCall; 
      
      static NAN_METHOD(New);`;
  }


  renderMemberImplementation(parent) {
    return `\
      ${this.emit('overloadFunctions')}
      
      bool ${parent.def.qualifiedName}::firstCall = true;
      
      NAN_METHOD(${parent.def.qualifiedName}::${this.methodName}) {
        if (!info.IsConstructCall()) {
          // [NOTE] generic recursive call with 'new'
          std::vector<v8::Local<v8::Value> > args(info.Length());
          for (std::size_t i = 0; i < args.size(); ++i) args[i] = info[i];
          auto inst = Nan::NewInstance(info.Callee(), args.size(), args.data());
          if (!inst.IsEmpty()) info.GetReturnValue().Set(inst.ToLocalChecked());
          return;
        }
        if(firstCall){
          auto wrapper = new ${parent.def.name}();
          wrapper->Wrap(info.This());
          firstCall = false;
          return;
        }
        ${this.emit('overloadCalls')}
      }`;
  }
  
  renderMemberInitialization(parent){
    return '';
  }
}
