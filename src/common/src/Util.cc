#include <common/Util.h>

template<>
bool Util::ConvertWrappedValue<double>(v8::Handle<v8::Value> value, double & result){
        Nan::HandleScope scope;
        if(!value->IsNumber()) {
                return false;
        }

        auto maybe = Nan::To<double>(value);
        if(!maybe.IsJust()){
                return false;
        }
        result = maybe.FromJust();
        return true;
}

template<>
bool Util::ConvertWrappedValue<int>(v8::Handle<v8::Value> value, int & result){
        Nan::HandleScope scope;
        if(!value->IsNumber()) {
                return false;
        }
        
        auto maybe = Nan::To<int32_t>(value);
        if(!maybe.IsJust()){
                return false;
        }
        result = maybe.FromJust();
        return true;
}
