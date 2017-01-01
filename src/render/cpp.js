
function renderClassIncludes(cls) {

}

function renderClassHeader(cls, wrappedAPI) {
  if (cls.declType !== 'class') return false;

  var base = 'Nan::ObjectWrap';
  if (hasWrappedBase(cls)) {
    var baseMod = cls.bases[0].name.split('::')[0];
    var baseName = cls.bases[0].name.split('::')[1];
    if (baseMod === cls.parent)
      base = baseName;
    else base = baseMod + '::' + baseName;
  }

  var wrappedType = cls.handle ? `Handle_${cls.origName}` : cls.origName;

  return {
    name: `${cls.name}.h`,
    src: `
// Class ${cls.name}
#ifndef ${cls.name.toUpperCase()}_H
#define ${cls.name.toUpperCase()}_H

#include <nan.h>
${renderClassIncludes(cls)}

namespace ${cls.parent} {
  class ${cls.name} : public ${base} {
  public:
    static NAN_MODULE_INIT(Init);
    static Nan::Persistent<v8::Object> prototype;
    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static v8::Local<v8::Object> BuildWrapper(void * res);
    ${cls.bases.length > 0 ? '' : `${wrappedType} wrappedObject;`}
  protected:
    // Wrap constructor
    ${cls.name}(${wrappedType} wrapObj);
    // Inheritance constructor
    ${cls.name}(${cls.origName} * wrapObj);

    // Wrapped constructors
  private:
    static NAN_METHOD(New);

    //Wrapped methods
  };

  CREATE_WRAPPER_TRAITS(${cls.origName}, ${cls.name})
}
#endif //${cls.name.toUpperCase()}_H
    `
  };
}
