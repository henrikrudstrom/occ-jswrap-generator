function renderClassHeader(wrapperAPI, cls) {
  if (cls.declType !== 'class') return false;

  var base = cls.getBaseClass();

  var wrappedType = cls.hasHandle ? `opencascade::handle<${cls.classKey}>` : cls.classKey;
  var includes = cls.getWrappedDependencies()
    .map(dep => `#include <${dep.parent.name}/${dep.name}.h>`)
    .join('\n');

  var methodDeclarations = cls.declarations
    .filter(decl => decl.declType === 'method')
    .filter(decl => decl.canBeWrapped())
    .map(decl => `static NAN_METHOD(${decl.cppName});`)
    .join('\n    ');

  var propertyGetters = cls.declarations
    .filter(decl => decl.declType === 'property')
    .filter(decl => decl.canBeWrapped())
    .map(decl => `static NAN_GETTER(${decl.cppGetterName});`)
    .join('\n    ');

  var propertySetters = cls.declarations
    .filter(decl => decl.declType === 'property')
    .map(decl => `static NAN_SETTER(${decl.cppSetterName});`)
    .join('\n    ');

  var emptyCtor = `${cls.name}();`;
  var ptrCtor = `${cls.name}(${cls.classKey} * wrapObj);`;
  var valueCtor = `${cls.name}(${cls.classKey} wrapObj);`;
  if (cls.hasHandle) {
    valueCtor = `${cls.name}(opencascade::handle<${cls.classKey}> wrapObj);`;
  }

  return `
// Class ${cls.name}
#ifndef ${cls.name.toUpperCase()}_H
#define ${cls.name.toUpperCase()}_H

#include <nan.h>
#include <common/Util.h>
#include <common/WrapperClassTraits.h>
#include <common/DynamicCastMap.h>

#include <${cls.classKey}.hxx>

${includes}

namespace ${cls.parent.name} {
  class ${cls.name} : public ${base ? base.name : 'Nan::ObjectWrap'} {
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
    static NAN_METHOD(New);

    ${propertyGetters}

    ${propertySetters}

    ${methodDeclarations}

  };


}

template<> struct wrapper_for_type<${cls.classKey}> { typedef ${cls.parent.name}::${cls.name} type; };
template<> struct wrapped_type<${cls.parent.name}::${cls.name}> { typedef ${cls.classKey} type; };

#endif //${cls.name.toUpperCase()}_H`;
}

module.exports = renderClassHeader;
