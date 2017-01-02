const nativeAPI = require('./nativeAPI');
const definitions = require('./wrapper/definitions.js');

class WrappedAPI {
  constructor(moduleConfigurations) {
    this.modules = moduleConfigurations.map(mod => definitions.create(this, null, mod));

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

  getWrapper(name) {
    return this.types[name];
  }

  getWrappedType(key) {
    switch (key) {
      case 'Standard_Boolean': return 'bool';
      case 'Standard_Integer': return 'int32_t';
      case 'Standard_Real': return 'double';
      default:
        var typeName = this.wrapped[key];
        return this.types[typeName];
    }
  }

  getNativeType(key) {
    return nativeAPI.get(this.native[key]);
  }

  isValidType(typename) {
    return Boolean(this.getWrappedType(typename));
  }
}

module.exports = WrappedAPI;
