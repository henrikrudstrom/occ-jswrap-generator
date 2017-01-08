#include <common/DynamicCastMap.h>

std::unordered_map<std::string, WrapBuilder> DynamicCastMap::constructorMap;

void DynamicCastMap::Register(std::string key, WrapBuilder builder){
    constructorMap.emplace(key, builder);
}

v8::Local<v8::Object> DynamicCastMap::Create(std::string key, void * res){
    return constructorMap[key](res);
}
