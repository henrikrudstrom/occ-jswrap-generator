#ifndef DYNAMICCASTMAP_H
#define DYNAMICCASTMAP_H

#include <nan.h>
#include <string>
#include <unordered_map>

typedef v8::Local<v8::Object> (* WrapBuilder)(void *);
class DynamicCastMap {
public:
    static void Register(std::string key, WrapBuilder builder);
    static v8::Local<v8::Object> Create(std::string key, void * res);
private:
    static std::unordered_map<std::string, WrapBuilder> constructorMap;
};

#endif //DYNAMICCASTMAP_H
