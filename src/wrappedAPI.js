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
      { name: 'double', nativeName: 'Standard_Real' },
      { name: 'int', nativeName: 'Standard_Integer' },
      { name: 'bool', nativeName: 'Standard_Boolean' }
    ];
    this.builtins.forEach((builtin) => {
      this.wrapped[builtin.nativeName] = builtin.name;
      this.native[builtin.name] = builtin.nativeName;
      this.types[builtin.name] = builtin;
    });
  }

  isBuiltIn(type) {
    if (type.name) type = type.name;
    return this.builtins.some(b => b.name === type || b.nativeName === type);
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
