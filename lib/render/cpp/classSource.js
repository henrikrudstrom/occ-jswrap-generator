function getWrappedObject(cls, wrapperVar) {
  if (cls.hasHandle)
    return `opencascade::handle<${cls.nativeClass.name}>::DownCast(${wrapperVar}->wrappedObject)`;
  return `${wrapperVar}->wrappedObject`;
}

function toJsValue(typemap, nativeType, variable) {
  if (nativeType === 'Standard_Real' ||
    nativeType === 'Standard_Boolean' ||
    nativeType === 'Standard_Boolean')
    return `Nan::New(${variable});`;

  var wrappedType = typemap.getWrappedType(nativeType);

  if (wrappedType === undefined)
    throw new Error(`dont know how to convert ${nativeType} to js value`);

  return `${wrappedType.qualifiedName}::BuildWrapper((void *) &${variable});`;
}

function fromJsValue(typemap, nativeType, resVar, inVar, failClause) {
  var wrappedType = typemap.getWrappedType(nativeType);

  if (wrappedType === undefined)
    throw new Error(`dont know how to convert from js value to '${nativeType}'`);

  var type = wrappedType.nativeName;

  var typeDecl = type;
  var convertFunction = `Util::ConvertWrappedValue<${type}>`;
  if (wrappedType.hasHandle) {
    typeDecl = `opencascade::handle<${type}>`;
    convertFunction = `Util::ConvertWrappedTransientValue<${type}>`;
  }

  return `\
${typeDecl} ${resVar};
if(!${convertFunction}(${inVar}, ${resVar})){
  ${failClause}
}`;
}


function renderOverload(typemap, cls, method, overload, index) {
  var nativeMethod = overload.nativeMethod;

  var argValues = nativeMethod.arguments.map((arg, i) =>
    fromJsValue(typemap, arg.type, 'arg' + i, `info[${i}]`, 'return false;')
  ).join('\n  ');

  var argNames = nativeMethod.arguments.map((arg, i) => 'arg' + i).join(', ');

  var isVoid = nativeMethod.returnType === 'void';
  var resultVariableOrNot = isVoid ? '' : 'auto result =';
  var assignReturnValue = isVoid ? '' : `\
  auto val = ${toJsValue(typemap, nativeMethod.returnType, 'result')}
  info.GetReturnValue().Set(val);`;

  return `\
bool ${method.name}Overload${index}(const Nan::FunctionCallbackInfo<v8::Value>& info){
  if(info.Length() != ${nativeMethod.arguments.length}) return false;

  ${argValues}

  auto wrapped = Nan::ObjectWrap::Unwrap<${cls.qualifiedName}>(info.Holder());
  auto obj = ${getWrappedObject(cls, 'wrapped')};
  ${resultVariableOrNot} obj${cls.dotOrArrow}${nativeMethod.name}(${argNames});

  ${assignReturnValue}

  return true;
}`;
}

function renderConstructorOverload(typemap, cls, overload, index) {
  var nativeMethod = overload.nativeMethod;

  var argValues = nativeMethod.arguments.map((arg, i) =>
    fromJsValue(typemap, arg.type, 'arg' + i, `info[${i}]`, 'return NULL;')
  ).join('\n  ');

  var argNames = nativeMethod.arguments.map((arg, i) => 'arg' + i).join(', ');

  return `\
${cls.nativeName} * ${cls.qualifiedName.replace('::', '_')}_ConstructorOverload${index}(const Nan::FunctionCallbackInfo<v8::Value>& info){
  if(info.Length() != ${nativeMethod.arguments.length}) return NULL;

  ${argValues}

  return new ${cls.nativeName}(${argNames});
}`;
}


function renderConstructor(typemap, cls) {
  var ctor = cls.getConstructor();
  if (ctor === undefined)
    return `NAN_METHOD(${cls.qualifiedName}::New) { }`;

  var overloadFunctions = ctor.overloads
    .filter(overload => overload.canBeWrapped())
    .map((overload, index) =>
      renderConstructorOverload(typemap, cls, overload, index)
    ).join('\n\n');

  var overloadCalls = ctor.overloads
    .filter(overload => overload.canBeWrapped())
    .map((overload, index) =>
      `res = ${cls.qualifiedName.replace('::', '_')}_ConstructorOverload${index}(info);
       if(res != NULL) {
        auto wrapper = new ${cls.name}(res);
        wrapper->Wrap(info.This());
        return;
      }`
    ).join('\n ');

  return `\
${overloadFunctions}
bool ${cls.qualifiedName}::firstCall = true;
NAN_METHOD(${cls.qualifiedName}::New) {
  if (!info.IsConstructCall()) {
    // [NOTE] generic recursive call with 'new'
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

  ${cls.nativeName} * res;

  ${overloadCalls}
}`;
}


function renderMethod(typemap, cls, method) {
  if (!method.canBeWrapped()) return `// method ${method.name} cannot be wrapped`;
  var overloadFunctions = method.overloads
    .filter(overload => overload.canBeWrapped())
    .map((overload, index) =>
      renderOverload(typemap, cls, method, overload, index)
    ).join('\n\n');

  var overloadCalls = method.overloads
    .filter(overload => overload.canBeWrapped())
    .map((overload, index) =>
      `if(${method.name}Overload${index}(info)) return;`
    ).join('\n ');
  return `\
${overloadFunctions}

NAN_METHOD(${cls.qualifiedName}::${method.cppName}) {
  ${overloadCalls}
}`;
}


function renderGetter(typemap, cls, property) {
  return `\
NAN_GETTER(${cls.qualifiedName}::${property.cppGetterName}) {
  auto wrapped = Nan::ObjectWrap::Unwrap<${cls.qualifiedName}>(info.Holder());
  auto obj = ${getWrappedObject(cls, 'wrapped')};
  auto result = obj${cls.dotOrArrow}${property.cppGetterName}();
  auto val = ${toJsValue(typemap, property.getType(), 'result')}
  info.GetReturnValue().Set(val);
}`;
}

function renderSetter(typemap, cls, property) {
  return `\
NAN_SETTER(${cls.qualifiedName}::${property.cppSetterName}) {
  auto wrapper = Nan::ObjectWrap::Unwrap<${cls.qualifiedName}>(info.Holder());
  // [NOTE] 'value' is defined argument in 'NAN_SETTER'
  ${fromJsValue(typemap, property.getType(), 'arg1', 'value', 'return;')}
  ${getWrappedObject(cls, 'wrapper')}${cls.dotOrArrow}${property.cppSetterName}(arg1);
}`;
}

function renderInit(typemap, cls) {
  var baseClass = cls.getBaseClass();
  var inherit = baseClass ? `ctor->Inherit(Nan::New(${baseClass.qualifiedName}::constructor));` : '';

  var properties = cls.members
    .filter(decl => decl.type === 'property')
    .filter(decl => decl.canBeWrapped())
    .map(prop => `Nan::SetAccessor(ctorInst, Nan::New("${prop.name}").ToLocalChecked(), ${prop.cppGetterName}, ${prop.cppSetterName});`)
    .join('\n  ');

  var methods = cls.members
    .filter(decl => decl.type === 'method')
    .filter(decl => decl.canBeWrapped())
    .map(decl => `Nan::SetPrototypeMethod(ctor, "${decl.name}", ${decl.cppName});`)
    .join('\n  ');

  return `\
NAN_MODULE_INIT(${cls.qualifiedName}::Init) {
  auto qualifiedName = Nan::New("${cls.qualifiedName}").ToLocalChecked();
  auto className = Nan::New("${cls.name}").ToLocalChecked();
  auto ctor = Nan::New<v8::FunctionTemplate>(New);

  auto ctorInst = ctor->InstanceTemplate(); // target for member functions
  ctor->SetClassName(qualifiedName);
  ctorInst->SetInternalFieldCount(1); // for ObjectWrap, it should set 1

  ${inherit}

  ${properties}

  ${methods}

  Nan::Set(target, className, Nan::GetFunction(ctor).ToLocalChecked());

  v8::Local<v8::Object> obj = Nan::To<v8::Object>(ctor->GetFunction()->NewInstance()->GetPrototype).ToLocalChecked();
  prototype.Reset(obj);
  constructor.Reset(ctor);

  DynamicCastMap::Register("${cls.nativeClass.name}", &BuildWrapper);
}
`;
}

function renderClassSource(typemap, cls) {
  var nativeClassType = cls.hasHandle ? `opencascade::handle<${cls.nativeName}>` : cls.nativeName;

  var getters = cls.members
    .filter(decl => decl.type === 'property')
    .map(decl => renderGetter(typemap, cls, decl))
    .join('\n\n');

  var setters = cls.members
    .filter(decl => decl.type === 'property')
    .map(decl => renderSetter(typemap, cls, decl))
    .join('\n\n');

  var methods = cls.members
    .filter(decl => decl.type === 'method')
    .map(decl => renderMethod(typemap, cls, decl))
    .join('\n\n');

  var base = cls.getBaseClass();
  var ctorName = `${cls.qualifiedName}::${cls.name}`;

  var emptyCtor = `${ctorName}() {}`;

  var ptrCtorArgs = `${cls.nativeName} * wrapObj`;
  var ptrCtorInit = `${base ? base.name : 'wrappedObject'}(${!cls.hasHandle && !cls.hasHandle ? '*' : ''}wrapObj)`;
  var ptrCtor = `${ctorName}(${ptrCtorArgs}) : ${ptrCtorInit} { }`;

  var valueCtorInit = `${base ? base.name : 'wrappedObject'}(wrapObj)`;
  var valueCtor = `${ctorName}(${cls.nativeName} wrapObj) : ${valueCtorInit} { }`;
  if (cls.hasHandle) {
    valueCtor = `${ctorName}(opencascade::handle<${cls.nativeName}> wrapObj) : ${valueCtorInit} { }`;
  }

  return `\
#include <${cls.parent.name}/${cls.name}.h>

Nan::Persistent<v8::FunctionTemplate> ${cls.qualifiedName}::constructor;
Nan::Persistent<v8::Object> ${cls.qualifiedName}::prototype;

${emptyCtor}
${ptrCtor}
${valueCtor}

${renderConstructor(typemap, cls)}

v8::Local<v8::Object> ${cls.qualifiedName}::BuildWrapper(void * res){
  auto obj = new ${cls.name}(*static_cast<${nativeClassType} *>(res));
  v8::Local<v8::Object> val = Nan::New(constructor)->GetFunction()->NewInstance(Nan::GetCurrentContext()).ToLocalChecked();
  obj->Wrap(val);
  return val;
}

${getters}

${setters}

${methods}

${renderInit(typemap, cls)}

`;
}

module.exports = renderClassSource;
