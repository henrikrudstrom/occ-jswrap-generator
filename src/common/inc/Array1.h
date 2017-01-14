#ifndef COLLECTION_H
#define COLLECTION_H

#include <common/Util.h>
#include <common/WrapperClassTraits.h>
#include <nan.h>
#include <NCollection_Array1.hxx>

template <class T>

class Array1 : public Nan::ObjectWrap {
    typedef typename wrapped_type<T>::type WrappedT;

   public:
    static NAN_MODULE_INIT(Init);
    Array1(int length);
    Array1(v8::Local<v8::Array> jsarray);

    NCollection_Array1<WrappedT> array;

   private:
    static NAN_METHOD(__cptr__);
    static void New(const Nan::FunctionCallbackInfo<v8::Value>& info);
    v8::Local<v8::Value> get(uint32_t index);
    static void GetIndex(uint32_t index, const Nan::PropertyCallbackInfo<v8::Value>& info);
    static void SetIndex(uint32_t index, v8::Local<v8::Value> value,
                         const Nan::PropertyCallbackInfo<v8::Value>& info);
    static NAN_GETTER(length);
    static NAN_METHOD(toArray);
};

template <class T>
NAN_METHOD(Array1<T>::__cptr__) {
  auto wrapped = Nan::ObjectWrap::Unwrap<Array1<T>>(info.Holder());
  int addr = reinterpret_cast<std::uintptr_t>(&wrapped->array);
  info.GetReturnValue().Set(Nan::New<v8::Int32>(addr));
}

template <class T>
void Array1<T>::New(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    if (!info.IsConstructCall()) {
        // [NOTE] generic recursive call with `new`
        std::vector<v8::Local<v8::Value>> args(info.Length());
        for (std::size_t i = 0; i < args.size(); ++i) args[i] = info[i];
        auto inst = Nan::NewInstance(info.Callee(), args.size(), args.data());
        if (!inst.IsEmpty()) info.GetReturnValue().Set(inst.ToLocalChecked());
        return;
    }
    if (info.Length() < 1) {
        Nan::ThrowError("invalid number of arguments");
        return;
    }
    if (info[0]->IsNumber()) {
        auto maybeIndex = Nan::To<int32_t>(info[0]);
        if (maybeIndex.IsJust()) {
            auto wrapper = new Array1(maybeIndex.FromJust());
            wrapper->Wrap(info.This());
            return;
        }
    }
    if (info[0]->IsArray()) {
        auto maybeArray = Nan::To<v8::Object>(info[0]);
        if (!maybeArray.IsEmpty()) {
            auto wrapper = new Array1(maybeArray.ToLocalChecked().As<v8::Array>());
            wrapper->Wrap(info.This());
            return;
        }
    }
    Nan::ThrowError("invalid arguments");
}

template <class T>
Array1<T>::Array1(int length) : array(1, length) {}

template <class T>
Array1<T>::Array1(v8::Local<v8::Array> jsarray) : array(1, jsarray->Length()) {
    for (int i = 0; i < jsarray->Length(); i++) {
        WrappedT res;
        if (!Util::ConvertWrappedValue<WrappedT>(jsarray->Get(Nan::New(i)), res)) {
            Nan::ThrowError("Array item not of correct type");
        }
        array.SetValue(i + 1, res);
    }
}

template <class T>
v8::Local<v8::Value> Array1<T>::get(uint32_t index){
    return T::BuildWrapper((void*)&array.Value(index));
}
template <>
v8::Local<v8::Value> Array1<double>::get(uint32_t index){
    return Nan::New(array.Value(index));
}
template <>
v8::Local<v8::Value> Array1<uint32_t>::get(uint32_t index){
    return Nan::New(array.Value(index));
}
template <>
v8::Local<v8::Value> Array1<bool>::get(uint32_t index){
    return Nan::New(array.Value(index));
}

template <class T>
void Array1<T>::GetIndex(uint32_t index, const Nan::PropertyCallbackInfo<v8::Value>& info) {
    auto wrapper = Nan::ObjectWrap::Unwrap<Array1<T>>(info.Holder());
    index = index + wrapper->array.Lower();
    if(index > wrapper->array.Upper()){
        Nan::ThrowRangeError("Index out of range.");
        return;
    }
    info.GetReturnValue().Set(wrapper->get(index));
}

template <class T>
void Array1<T>::SetIndex(uint32_t index, v8::Local<v8::Value> value,
                         const Nan::PropertyCallbackInfo<v8::Value>& info) {
    auto wrapper = Nan::ObjectWrap::Unwrap<Array1<T>>(info.Holder());
            index = index + wrapper->array.Lower();
            if(index >= wrapper->array.Upper()){
                Nan::ThrowRangeError("Index out of range.");
                return;
            }
    WrappedT res;
    Util::ConvertWrappedValue<WrappedT>(value, res);
    wrapper->array.SetValue(index, res);
}

template<class T>
NAN_GETTER(Array1<T>::length) {
    auto wrapper = Nan::ObjectWrap::Unwrap<Array1<T>>(info.Holder());
    info.GetReturnValue().Set(Nan::New(wrapper->array.Size()));
}

template<class T>
NAN_METHOD(Array1<T>::toArray){
    auto wrapper = Nan::ObjectWrap::Unwrap<Array1<T>>(info.Holder());
    v8::Local<v8::Array> result = Nan::New<v8::Array>();
    for(int i = wrapper->array.Lower(); i <= wrapper->array.Upper(); i++){
        result->Set(Nan::New(i - wrapper->array.Lower()), wrapper->get(i));
    }
    info.GetReturnValue().Set(result);
}

template <class T>
NAN_MODULE_INIT(Array1<T>::Init) {
    std::string tname(wrapped_type<T>::name);
    auto cname = Nan::New("Array1Of" + tname).ToLocalChecked();
    auto ctor = Nan::New<v8::FunctionTemplate>(New);
    auto ctorInst = ctor->InstanceTemplate();  // target for member functions
    ctor->SetClassName(cname);                 // as `ctor.name` in JS
    ctorInst->SetInternalFieldCount(1);        // for ObjectWrap, it should set 1
    Nan::SetPrototypeMethod(ctor, "__cptr__", __cptr__);
    Nan::SetIndexedPropertyHandler(ctorInst, GetIndex, SetIndex);
    Nan::SetAccessor(ctorInst, Nan::New("length").ToLocalChecked(), length);

    Nan::Set(target, cname, Nan::GetFunction(ctor).ToLocalChecked());
}

#endif  // COLLECTION_H
