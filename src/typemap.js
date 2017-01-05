class Typemap {
  constructor() {
    this.wrapped = {};
    this.native = {};
    this.types = {};
  }

  populate(item) {
    if (this.definesType(item)) {
      this.wrapped[this.getNativeName(item)] = this.getName(item);
      this.native[this.getName(item)] = this.getNativeName(item);
      this.types[this.getName(item)] = item;
    }
  }

  isBuiltIn(typeName) {
    var type = this.types[this.wrapped[typeName]];
    return type !== undefined && type.type === 'builtin';
  }

  getWrappedType(key) {
    var typeName = this.wrapped[key];
    return this.types[typeName];
  }

  isValidType(typename) {
    return Boolean(this.getWrappedType(typename));
  }
}

class DefinitionTypemap extends Typemap {
  definesType(item) {
    return item.isType;
  }
  getMembers(item) {
    return item.members || [];
  }
  getName(item) {
    return item.name;
  }
  getNativeName(item) {
    return item.nativeName;
  }
}

class RendererTypemap extends Typemap {
  definesType(item) {
    return item.def.isType;
  }
  getMembers(item) {
    return item.renderers || [];
  }
  getName(item) {
    return item.def.name;
  }
  getNativeName(item) {
    return item.def.nativeName;
  }
}

module.exports = { Definition: DefinitionTypemap, Renderer: RendererTypemap };
