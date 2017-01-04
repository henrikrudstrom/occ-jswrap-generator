const nativeAPI = require('./nativeAPI');
const Module = require('./model/module.js');
const factory = require('./factory.js');

class WrappedAPI {
  constructor(conf) {
    this.modules = conf.members.map(mod => factory.createDefinition(this, null, mod));

    this.wrapped = {};
    this.native = {};
    this.types = {};

    this.modules.forEach((mod) => {
      mod.members.forEach((cls) => {
        this.wrapped[cls.getKeys()[0]] = cls.name;
        this.native[cls.name] = cls.getKeys()[0];
        this.types[cls.name] = cls;
      });
    });

    this.builtins = [
      { name: 'double', classKey: 'Standard_Real' },
      { name: 'int', classKey: 'Standard_Integer' },
      { name: 'bool', classKey: 'Standard_Boolean' }
    ];
    this.builtins.forEach((builtin) => {
      this.wrapped[builtin.classKey] = builtin.name;
      this.native[builtin.name] = builtin.classKey;
      this.types[builtin.name] = builtin;
    });
  }

  isBuiltIn(type) {
    if (type.name) type = type.name;
    return this.builtins.some(b => b.name === type || b.classKey === type);
  }

  getWrapper(name) {
    return this.types[name];
  }

  getWrappedType(key) {
    var typeName = this.wrapped[key];
    return this.types[typeName];
  }

  getNativeType(key) {
    return nativeAPI.get(this.native[key]);
  }

  isValidType(typename) {
    return Boolean(this.getWrappedType(typename));
  }
}

module.exports = WrappedAPI;
