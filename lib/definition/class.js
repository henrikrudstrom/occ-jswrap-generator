const ContainerDefinition = require('./container.js');
const ConstructorConfiguration = require('../configuration/callable.js').ConstructorConfiguration;
const nativeAPI = require('../nativeAPI.js');


class ClassDefinition extends ContainerDefinition {
  constructor(conf, factory, typemap, parent) {
    super(conf, factory, typemap, parent);
    this.nativeName = conf.nativeName;
    this.qualifiedName = `${this.parent.name}::${this.name}`;
    this.relativePath = `${this.parent.name}/${this.name}`;
    this.dotOrArrow = this.hasHandle ? '->' : '.';
    this.nativeClass = nativeAPI.get(this.nativeName);
    this.hasHandle = this.$hasHandle(this.nativeClass);
    this.isType = true;
    if (!this.getConstructor()) {
      // include empty constructor by default
      var ctor = factory.create(
        new ConstructorConfiguration(this.name, [], 'constructorOverload'), this);
      this.members = [ctor].concat(this.members);
    }
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
    var nativeBase = this.getNativeBaseClass();
    return nativeBase ? this.typemap.getWrappedType(nativeBase) : undefined;
  }

  getBaseLevel() {
    if (!this.getBaseClass()) return 0;
    return this.getBaseClass().getBaseLevel() + 1
  }

  getKeys() {
    return [this.nativeName];
  }

  getConstructor() {
    return this.members.filter(decl => decl.declType === 'constructor')[0];
  }
}
ClassDefinition.prototype.declType = 'class';

module.exports = ClassDefinition;
