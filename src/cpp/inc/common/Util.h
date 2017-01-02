#ifndef UTIL_H
#define UTIL_H

#include <nan.h>
#include <iostream>
#include <Standard_Transient.hxx>
#include <common/WrapperClassTraits.h>

using namespace std;


namespace Util {
template<class T>
static T* CheckedUnWrap(v8::Handle<v8::Value> value){
        if(!value->IsObject()) {
                Nan::ThrowError("Argument is not an object");
                return NULL;
        }

        auto maybeHandle = Nan::To<v8::Object>(value);
        if(maybeHandle.IsEmpty()) {
                Nan::ThrowError("Argument cannot be empty");
                return NULL;
        }

        auto handle = maybeHandle.ToLocalChecked();
        if (handle->InternalFieldCount() < 1) {
                Nan::ThrowError("Argument error");
                return NULL;
        }

        v8::Handle<v8::Value> objproto = handle->GetPrototype();
        v8::Handle<v8::Value> targetProto = Nan::New(T::prototype);
        Nan::MaybeLocal<v8::Object> maybeProto;

        while (objproto != targetProto) {
                maybeProto = Nan::To<v8::Object>(objproto);
                if(maybeProto.IsEmpty()) {
                        Nan::ThrowError("Argument error");
                        return NULL;
                }
                objproto = maybeProto.ToLocalChecked()->GetPrototype();
                if(objproto.IsEmpty()) {
                        Nan::ThrowError("Argument error");
                        return NULL;
                }
        }
        return Nan::ObjectWrap::Unwrap<T>(handle);
}


// template<typename T>
// static bool ConvertNativeValue(v8::Handle<v8::Value> value, T & result);
//
// template <>
// static bool ConvertNativeValue<double>(v8::Handle<v8::Value> value, double & result){
//         if(!value->IsNumber()) {
//                 Nan::ThrowError("Argument is not a double.");
//                 return false;
//         }
//
//         auto maybe = Nan::To<double>(value);
//         if(!maybe.IsJust()){
//                 Nan::ThrowError("Argument double is not Just.");
//                 return false;
//         }
//         result = Nan::To<double>(value).FromJust();
//         return true;
// }
//
// template <>
// static bool ConvertNativeValue<int>(v8::Handle<v8::Value> value, int & result){
//         if(!value->IsNumber()) {
//                 Nan::ThrowError("Argument is not a double.");
//                 return false;
//         }
//
//         auto maybe = Nan::To<double>(value);
//         if(!maybe.IsJust()){
//                 Nan::ThrowError("Argument double is not Just.");
//                 return false;
//         }
//         result = Nan::To<int32_t>(value).FromJust();
//         return true;
// }

template<class T>
static bool ConvertWrappedValue(v8::Handle<v8::Value> value, T & result){
        auto wrapper = Util::CheckedUnWrap<typename wrapper_for_type<T>::type>(value);
        if(wrapper == NULL) return false;
        result = wrapper->wrapObj;
        return true;
}

template<class T>
static bool ConvertWrappedTransientValue(v8::Handle<v8::Value> value, opencascade::handle<T> &result){
        auto wrapper = Util::CheckedUnWrap<typename wrapper_for_type<T>::type>(value);
        if(wrapper == NULL) return false;
        result = opencascade::handle<T>::DownCast(wrapper->wrapObj);
        return true;
}
}

#endif