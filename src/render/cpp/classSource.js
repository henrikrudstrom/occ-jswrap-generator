function getWrappedObject(cls, wrapperVar) {
  if (cls.hasHandle)
    return `opencascade::handle<${cls.nativeClass.name}>::DownCast(${wrapperVar}->wrappedObject)`;
  return `${wrapperVar}->wrappedObject`;
}

function toJsValue(wrapperAPI, nativeType, variable) {
  if (nativeType === 'Standard_Real' ||
    nativeType === 'Standard_Boolean' ||
    nativeType === 'Standard_Boolean')
    return `Nan::New(${variable});`;

  var wrappedType = wrapperAPI.getWrappedType(nativeType);

  if (wrappedType === undefined)
    throw new Error(`dont know how to convert ${nativeType} to js value`);

  return `${wrappedType.name}::BuildWrapper((void *) &${variable});`;
}

function fromJsValue(wrapperAPI, nativeType, resVar, inVar) {
  if (nativeType === 'Standard_Real')
    return `auto ${resVar} = Nan::To<double>(${inVar}).FromJust();`;
  if (nativeType === 'Standard_Integer')
    return `auto ${resVar} = Nan::To<int32_t>(${inVar}).FromJust();`;
  if (nativeType === 'Standard_Boolean')
    return `auto ${resVar} = Nan::To<bool>(${inVar}).FromJust();`;

  var wrappedType = wrapperAPI.getWrappedType(nativeType);

  if (wrappedType === undefined)
    throw new Error(`dont know how to convert from js value to '${nativeType}'`);

  if (wrappedType.hasHandle)
    return `\
opencascade::handle<${wrappedType.name}> ${resVar};
if(!Util::ConvertWrappedTransientValue<${wrappedType.name}>(${inVar}, ${resVar}))
    return;
`;
  return `\
${wrappedType.name} ${resVar};
if(!Util::ConvertWrappedValue<${wrappedType.name}>(${inVar}, ${resVar}))
    return;
  `;
}


function renderGetter(wrapperAPI, cls, property) {
  return `\
NAN_GETTER(${cls.qualifiedName}::${property.cppGetterName}) {
  auto wrapped = Nan::ObjectWrap::Unwrap<${cls.name}>(info.Holder());
  auto obj = ${getWrappedObject(cls, 'wrapped')};
  auto result = obj${cls.dotOrArrow}${property.cppGetterName}();
  auto val = ${toJsValue(wrapperAPI, property.getType(), 'result')}
  info.GetReturnValue().Set(val);
}`;
}

function renderSetter(wrapperAPI, cls, property) {
  return `\
NAN_SETTER(${cls.qualifiedName}::${property.cppSetterName}) {
  auto wrapper = Nan::ObjectWrap::Unwrap<${cls.name}>(info.Holder());
  // [NOTE] 'value' is defined argument in 'NAN_SETTER'
  ${fromJsValue(wrapperAPI, property.getType(), 'arg1', 'value')}
  ${getWrappedObject(cls, 'wrapper')}${cls.dotOrArrow}${property.cppSetterName}(arg1);
}`;
}

function renderInit(wrapperAPI, cls) {
  var baseClass = cls.getBaseClass();
  var inherit = baseClass ? `ctor->Inherit(Nan::New(${baseClass.qualifiedName}::constructor));` : '';

  var properties = cls.declarations
    .filter(decl => decl.declType === 'property')
    .map(prop => `Nan::SetAccessor(ctorInst, Nan::New("${prop.name}").ToLocalChecked(), ${prop.cppGetterName}, ${prop.cppSetterName});`)
    .join('\n  ');

  return `\
NAN_MODULE_INIT(${cls.qualifiedName}::Init) {
  auto className = Nan::New("${cls.qualifiedName}").ToLocalChecked();
  auto ctor = Nan::New<v8::FunctionTemplate>(New);

  auto ctorInst = ctor->InstanceTemplate(); // target for member functions
  ctor->SetClassName(className);
  ctorInst->SetInternalFieldCount(1); // for ObjectWrap, it should set 1

  ${inherit}

  ${properties}

  Nan::Set(target, className, Nan::GetFunction(ctor).ToLocalChecked());

  v8::Local<v8::Object> obj = Nan::To<v8::Object>(ctor->GetFunction()->NewInstance()->GetPrototype()).ToLocalChecked();
  prototype.Reset(obj);
  constructor.Reset(ctor);

  DynamicCastMap::Register("${cls.nativeClass.name}", &BuildWrapper);
}
`;
}

function renderClassSource(wrapperAPI, cls) {
  var nativeClassType = cls.hasHandle ? `opencascade::handle<${cls.classKey}>` : cls.classKey;

  var getters = cls.declarations
    .filter(decl => decl.declType === 'property')
    .map(decl => renderGetter(wrapperAPI, cls, decl))
    .join('\n\n');

  var setters = cls.declarations
    .filter(decl => decl.declType === 'property')
    .map(decl => renderSetter(wrapperAPI, cls, decl))
    .join('\n\n');

  return `\
#include <${cls.parent.name}/${cls.name}.h>

Nan::Persistent<v8::FunctionTemplate> ${cls.qualifiedName}::constructor;
Nan::Persistent<v8::Object> ${cls.qualifiedName}::prototype;

NAN_METHOD(${cls.qualifiedName}::New) {
}

v8::Local<v8::Object> ${cls.qualifiedName}::BuildWrapper(void * res){
  auto obj = new ${cls.name}(*static_cast<${nativeClassType} *>(res));
  v8::Local<v8::Object> val = Nan::New(constructor)->GetFunction()->NewInstance(Nan::GetCurrentContext()).ToLocalChecked();
  obj->Wrap(val);
  return val;
}

${getters}

${setters}

${renderInit(wrapperAPI, cls)}

`;
}

module.exports = renderClassSource;
