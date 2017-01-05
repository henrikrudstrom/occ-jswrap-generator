const Container = require('./container.js');
//const Method = require('./method.js');
//const Property = require('./property.js');
//const Constructor = require('./constructor.js');
const nativeAPI = require('../nativeAPI.js');
const upperCamelCase = require('uppercamelcase');


class ClassDefinition extends Container.Definition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.nativeName = conf.nativeName;
    this.qualifiedName = `${this.parent.name}::${this.name}`;
    this.dotOrArrow = this.hasHandle ? '->' : '.';
    this.nativeClass = nativeAPI.get(this.nativeName);
    this.hasHandle = this.$hasHandle(this.nativeClass);
    this.isType = true;
  }

  $hasHandle(nativeCls) {
    if (!nativeCls.bases || !nativeCls.bases[0]) return false;
    if (nativeCls.bases[0].name === 'Standard_Transient') return true;
    return this.$hasHandle(nativeAPI.get(nativeCls.bases[0].name));
  }

  getWrappedDependencies() {
    return this.members
      .filter(decl => decl.canBeWrapped())
      .map(decl => decl.getWrappedDependencies())
      .concat(this.getBaseClass() ? [this.getBaseClass()] : [])
      .reduce((a, b) => a.concat(b), [])
      .filter((t, index, array) => array.indexOf(t) === index)
      .filter(t => t.qualifiedName !== this.qualifiedName);
  }

  getNativeBaseClass() {
    if (this.nativeClass.bases.length < 1) return undefined;
    return this.nativeClass.bases[0].name;
  }

  getBaseClass() {
    return this.typemap.getWrappedType(this.getNativeBaseClass());
  }

  getKeys() {
    return [this.nativeName];
  }

  getConstructor() {
    return this.members.filter(decl => decl.declType === 'constructor')[0];
  }
}

class ClassConfiguration extends Container.Configuration {
  constructor(name, key) {
    super(name, 'class');
    this.nativeName = key;
    this.isType = true;
  }

  getKeys() {
    return [this.nativeName];
  }
}

module.exports = {
  Configuration: ClassConfiguration,
  Definition: ClassDefinition
};
