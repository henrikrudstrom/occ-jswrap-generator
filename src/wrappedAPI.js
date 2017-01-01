const nativeAPI = require('./nativeAPI');

class WrappedAPI {
  constructor(modules) {
    this.modules = modules;
    this.wrapped = {};
    this.native = {};
    this.types = {};

    this.modules.forEach((mod) => {
      mod.declarations.forEach((cls) => {
        this.wrapped[cls.getKeys()[0]] = cls.name;
        this.native[cls.name] = cls.getKeys()[0];
        this.types[cls.name] = cls;
      });
    });
  }

  getWrappedType(key) {
    return this.types[this.wrapped[key]];
  }

  getNativeType(key) {
    return nativeAPI.get(this.native[key]);
  }
}

module.exports = WrappedAPI;
