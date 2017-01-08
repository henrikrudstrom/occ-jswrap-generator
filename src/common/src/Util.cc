#include <common/Util.h>

template<>
bool Util::ConvertWrappedValue<double>(v8::Handle<v8::Value> value, double & result){
        if(!value->IsNumber()) {
                Nan::ThrowError("Argument is not a double.");
                return false;
        }

        auto maybe = Nan::To<double>(value);
        if(!maybe.IsJust()){
                Nan::ThrowError("Argument double is not Just.");
                return false;
        }
        result = maybe.FromJust();
        return true;
}

template<>
bool Util::ConvertWrappedValue<int>(v8::Handle<v8::Value> value, int & result){
        if(!value->IsNumber()) {
                Nan::ThrowError("Argument is not a double.");
                return false;
        }

        auto maybe = Nan::To<int32_t>(value);
        if(!maybe.IsJust()){
                Nan::ThrowError("Argument double is not Just.");
                return false;
        }
        result = maybe.FromJust();
        return true;
}
