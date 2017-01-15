#define ENUM_VALUE(enumName, name, value) \
    Nan::SetAccessor(enumObj, Nan::New(#name).ToLocalChecked(), \
        [](v8::Local<v8::String> prop, const Nan::PropertyCallbackInfo<v8::Value>& info){ \
            info.GetReturnValue().Set(Nan::New(value)); \
        }); 

#define ENUM_START(enumName) \
void GetEnum_##enumName(v8::Local<v8::String> prop, const Nan::PropertyCallbackInfo<v8::Value>& info){ \
    auto enumObj = Nan::New<v8::Object>();

#define ENUM_END info.GetReturnValue().Set(enumObj); }

#define ADD_ENUM(enumName) Nan::SetAccessor(target, Nan::New(#enumName).ToLocalChecked(), GetEnum_##enumName)
