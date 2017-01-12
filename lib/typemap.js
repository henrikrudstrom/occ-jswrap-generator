const nativeAPI = require('../lib/nativeAPI.js');

class Typemap {
  constructor() {
    this.wrapped = {};
    this.native = {};
    this.types = {};
    this.inheritedFrom = {};
  }

  addInherited(inherited) {
    var nativeCls = nativeAPI.get(inherited);
    if (!nativeCls.bases || !nativeCls.bases.length) return;
    var base = nativeCls.bases[0].name;
    if (!this.inheritedFrom[base])
      this.inheritedFrom[base] = [];
    this.inheritedFrom[base].push(inherited);
  }

  populate(item) {
    if (this.definesType(item)) {
      this.wrapped[this.getNativeName(item)] = this.getName(item);
      this.native[this.getName(item)] = this.getNativeName(item);
      this.types[this.getName(item)] = item;
      this.addInherited(this.getNativeName(item));
    }
  }

  stripHandleFromName(typename) {
    return typename.replace('opencascade::handle<', '').replace('>', '');
  }

  getInheritedTypes(typeName) {
    var inherited = this.inheritedFrom[this.stripHandleFromName(typeName)] || [];
    return [inherited].concat(inherited.map(inh => this.getInheritedTypes(inh)))
      .reduce((a, b) => a.concat(b), [])
      .filter((obj, index, array) => array.indexOf(obj) === index);
  }

  isBuiltIn(typeName) {
    var type = this.types[this.wrapped[typeName]];
    return type !== undefined && type.declType === 'builtin';
  }

  getWrappedType(key) {
    var typeName = this.wrapped[this.stripHandleFromName(key)];
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
  getBases(item) {
    return item.nativeClass.bases;
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
  getBases(item) {
    return item.def.nativeClass.bases;
  }
}

module.exports = { Definition: DefinitionTypemap, Renderer: RendererTypemap };
