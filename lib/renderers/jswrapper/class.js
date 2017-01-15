const base = require('../base.js');

class ClassRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);

    this.renderers = def.members.map(member => factory.create(member));

    var nativeClassName = this.def.nativeClass.name;
    this.nativeTypeDecl = nativeClassName;
    this.convertFunction = `Util::ConvertWrappedValue<${nativeClassName}>`;
    if (this.def.hasHandle) {
      this.nativeTypeDecl = `opencascade::handle<${this.def.nativeClass.name}>`;
      this.convertFunction = `Util::ConvertWrappedTransientValue<${this.def.nativeClass.name}>`;
    }
  }

  toNative(resVar, inVar, failClause) {
    return `\
      if(!${this.convertFunction}(${inVar}, ${resVar})){
        ${failClause}
      }`;
  }

  toJs(inVar) {
    if (this.def.isAbstract && this.def.hasHandle)
      return `DynamicCastMap::Create(${inVar}->DynamicType()->Name(), (void *) &${inVar})`
    return `${this.def.qualifiedName}::BuildWrapper((void *) &${inVar})`;
  }

  renderIncludeClass() {
    return `#include <${this.def.parent.name}/${this.def.name}.h>`;
  }

  renderModuleInitCall() {
    return `${this.def.qualifiedName}::Init(target);`;
  }

  renderMain(content) {
    content[`[inc]/${this.def.parent.name}/${this.def.name}.h`] = this.renderHeaderFile();
    content[`[src]/${this.def.parent.name}/${this.def.name}.cc`] = this.renderImplementationFile();
    return super.renderMain(content);
  }

  renderIncludes() {
    return this.def.getWrappedDependencies()
      .map(dep => `#include <${dep.parent.name}/${dep.name}.h>`)
      .concat(this.emit('renderIncludes')
        .reduce((a, b) => a.concat(b), [])
        .filter((inc, i, array) => array.indexOf(inc) === i))
      .join('\n');
  }

  renderHeaderFile() {
    var name = this.def.name;
    var base = this.def.getBaseClass();
    var baseClass = base ? base.qualifiedName : 'Nan::ObjectWrap';
    var nativeName = this.def.nativeName;

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

      #include <${this.def.nativeName}.hxx>

      ${this.renderIncludes()}

      namespace ${this.def.parent.name} {
        class ${name} : public ${baseClass} {
        public:
          static NAN_MODULE_INIT(Init);
          static Nan::Persistent<v8::Object> prototype;
          static Nan::Persistent<v8::FunctionTemplate> constructor;
          static v8::Local<v8::Object> BuildWrapper(void * res);
          ${base ? '' : `${wrappedType} wrappedObject;`}
          ${emptyCtor}
          ${ptrCtor}
          ${valueCtor}
        protected:


        private:
          static NAN_METHOD(__cptr__);
          ${this.emit('renderMemberDeclarations').join('\n')}
        };
      }

      template<> struct wrapper_for_type<${nativeName}> {
        typedef ${this.def.qualifiedName} type;
      };
      template<> struct wrapped_type<${this.def.qualifiedName}> {
        typedef ${nativeName} type;
        constexpr static const char * name = "${this.def.name}";
      };

      #endif //${name.toUpperCase()}_H`;
  }

  renderImplementationFile() {
    var name = this.def.name;
    var qualifiedName = this.def.qualifiedName;
    var nativeName = this.def.nativeName;
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
    #include <${this.def.parent.name}/${this.def.name}.h>

    Nan::Persistent<v8::FunctionTemplate> ${qualifiedName}::constructor;
    Nan::Persistent<v8::Object> ${qualifiedName}::prototype;

    ${emptyCtor}
    ${ptrCtor}
    ${valueCtor}

    v8::Local<v8::Object> ${qualifiedName}::BuildWrapper(void * res){
      Nan::EscapableHandleScope  scope;
      v8::TryCatch errorHandler;

      v8::Local<v8::Function> func = Nan::GetFunction(Nan::New(constructor)).ToLocalChecked();
      v8::Local<v8::Value> args[1];
      args[0] = Nan::New<v8::External>(res);
      v8::MaybeLocal<v8::Object> maybeVal = Nan::NewInstance(func, 1, args);

      return scope.Escape(maybeVal.ToLocalChecked());
    }

    NAN_METHOD(${qualifiedName}::__cptr__) {
      auto wrapped = Nan::ObjectWrap::Unwrap<${qualifiedName}>(info.Holder());
      int addr = reinterpret_cast<std::uintptr_t>(&wrapped->wrappedObject);
      info.GetReturnValue().Set(Nan::New<v8::Int32>(addr));
    }

    ${this.emit('renderMemberImplementation').join('\n')}

    NAN_MODULE_INIT(${qualifiedName}::Init) {
      auto qualifiedName = Nan::New("${qualifiedName}").ToLocalChecked();
      auto className = Nan::New("${name}").ToLocalChecked();
      auto ctor = Nan::New<v8::FunctionTemplate>(New);
      auto ctorInst = ctor->InstanceTemplate(); // target for member functions
      ctor->SetClassName(qualifiedName);
      ctorInst->SetInternalFieldCount(1); // for ObjectWrap, it should set 1
      ${inherit}

      Nan::SetPrototypeMethod(ctor, "__cptr__", __cptr__);
      ${this.emit('renderMemberInitialization').join('\n')}

      Nan::Set(target, className, Nan::GetFunction(ctor).ToLocalChecked());
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(ctor->GetFunction()->NewInstance()->GetPrototype()).ToLocalChecked();
      prototype.Reset(obj);
      constructor.Reset(ctor);

      DynamicCastMap::Register("${this.def.nativeClass.name}", &BuildWrapper);
    }`;
  }
}
ClassRenderer.prototype.declType = 'class';
module.exports = ClassRenderer;
