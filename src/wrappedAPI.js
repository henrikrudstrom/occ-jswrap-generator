const nativeAPI = require('./nativeAPI');
const definitions = require('./wrapper/definitions.js');

class WrappedAPI {
  constructor(modules) {
    this.modules = modules.map(mod => definitions.create(this, null, mod));
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

  getWrapper(name){
    return this.types[name];
  }

  getWrappedType(key) {
    return this.types[this.wrapped[key]];
  }

  getNativeType(key) {
    return nativeAPI.get(this.native[key]);
  }
}

module.exports = WrappedAPI;
