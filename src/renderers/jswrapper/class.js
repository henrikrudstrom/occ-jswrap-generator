

class ClassRenderer extends Renderer {
  constructor(def) {
    super();
    this.def = def;
    this.renderers = def.declarations.map(decl => factory.createRenderer(decl));
  }

  renderIncludeClass() {
    return `#include <${this.def.qualifiedName}.h>`;
  }

  renderModuleInitCall() {
    return `${this.def.qualifiedName}::Init(target);`;
  }

  renderHeaderFile() {
    var name = this.def.name;
    var base = this.def.getWrappedBase();
    var baseClass = base || 'Nan::ObjectWrap';
    var nativeName = this.def.classKey;

    var includes = this.def.getWrappedDependencies()
      .map(dep => `#include <${dep.parent.name}/${dep.name}.h>`)
      .join('\n');

    var wrappedType = this.def.hasHandle ? `opencascade::handle<${nativeName}>` : nativeName;

    var emptyCtor = `${name}();`;
    var ptrCtor = `${name}(${nativeName} * wrapObj);`;
    var valueCtor = `${name}(${nativeName} wrapObj);`;
    if (this.def.hasHandle) {
      valueCtor = `${name}(opencascade::handle<${nativeName}> wrapObj);`;
    }

    return `\
      // Class ${name}
      #ifndef ${name.toUpperCase()}_H
      #define ${name.toUpperCase()}_H

      #include <nan.h>
      #include <common/Util.h>
      #include <common/WrapperClassTraits.h>
      #include <common/DynamicCastMap.h>

      #include <${this.def.classKey}.hxx>

      ${includes}

      namespace ${this.def.parent.name} {
        class ${name} : public ${baseClass} {
        public:
          static NAN_MODULE_INIT(Init);
          static Nan::Persistent<v8::Object> prototype;
          static Nan::Persistent<v8::FunctionTemplate> constructor;
          static v8::Local<v8::Object> BuildWrapper(void * res);
          ${base ? '' : `${wrappedType} wrappedObject;`}
        protected:
          ${emptyCtor}
          ${ptrCtor}
          ${valueCtor}

        private:
          static bool firstCall;

          ${this.emit('memberDeclarations')}
        };
      }

      template<> struct wrapper_for_type<${nativeName}> { typedef ${this.def.qualifiedName} type; };
      template<> struct wrapped_type<${this.def.qualifiedName}> { typedef ${nativeName} type; };

      #endif //${name.toUpperCase()}_H`;
  }

  renderImplementationFile() {
    var name = this.def.name;
    var qualifiedName = this.def.qualifiedName;
    var nativeName = this.def.classKey;
    var hasHandle = this.def.hasHandle;
    var base = this.def.getBaseClass();

    var nativeClassType = hasHandle ? `opencascade::handle<${nativeName}>` : nativeName;

    var ctorName = `${qualifiedName}::${name}`;

    var emptyCtor = `${ctorName}() {}`;

    var ptrCtorArgs = `${nativeName} * wrapObj`;
    var ptrCtorInit = `${base ? base.name : 'wrappedObject'}(${!hasHandle && !hasHandle ? '*' : ''}wrapObj)`;
    var ptrCtor = `${ctorName}(${ptrCtorArgs}) : ${ptrCtorInit} { }`;

    var valueCtorInit = `${base ? base.name : 'wrappedObject'}(wrapObj)`;
    var valueCtor = `${ctorName}(${nativeName} wrapObj) : ${valueCtorInit} { }`;
    if (hasHandle) {
      valueCtor = `${ctorName}(opencascade::handle<${nativeName}> wrapObj) : ${valueCtorInit} { }`;
    }

    var inherit = base ?
      `ctor->Inherit(Nan::New(${base.qualifiedName}::constructor));` : '';

    return `\
    ${this.renderClassInclude()}

    Nan::Persistent<v8::FunctionTemplate> ${qualifiedName}::constructor;
    Nan::Persistent<v8::Object> ${qualifiedName}::prototype;

    ${emptyCtor}
    ${ptrCtor}
    ${valueCtor}

    v8::Local<v8::Object> ${qualifiedName}::BuildWrapper(void * res){
      auto obj = new ${name}(*static_cast<${nativeClassType} *>(res));
      v8::Local<v8::Object> val = Nan::New(constructor)->GetFunction()->NewInstance(Nan::GetCurrentContext()).ToLocalChecked();
      obj->Wrap(val);
      return val;
    }

    ${this.emit('memberImplementation')}

    NAN_MODULE_INIT(${qualifiedName}::Init) {
      auto qualifiedName = Nan::New("${qualifiedName}").ToLocalChecked();
      auto className = Nan::New("${name}").ToLocalChecked();
      auto ctor = Nan::New<v8::FunctionTemplate>(New);
      auto ctorInst = ctor->InstanceTemplate(); // target for member functions
      ctor->SetClassName(qualifiedName);
      ctorInst->SetInternalFieldCount(1); // for ObjectWrap, it should set 1
      ${inherit}

      ${this.emit('memberInitialization')}

      Nan::Set(target, className, Nan::GetFunction(ctor).ToLocalChecked());
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(ctor->GetFunction()->NewInstance()->GetPrototype()).ToLocalChecked();
      prototype.Reset(obj);
      constructor.Reset(ctor);

      DynamicCastMap::Register("${this.def.nativeClass.name}", &BuildWrapper);
    }`;
  }
}

factory.registerRenderer('class', ClassRenderer);
