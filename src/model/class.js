const Container = require('./container.js');
const Method = require('./method.js');
const Property = require('./property.js');
const Constructor = require('./constructor.js');
const nativeAPI = require('../nativeAPI.js');

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

factory.registerDefinition('class', ClassDefinition);

class ClassConfiguration extends Container.Configuration {
  constructor(name, key) {
    super(name, 'class');
    this.nativeName = key;
    this.isType = true;
  }

  $wrapMethod(methodConf) {
    var existingMember = this.getMemberByName(methodConf.name);
    if (existingMember !== undefined) {
      existingMember.overload(methodConf);
    } else
      this.members.push(methodConf);

    return this;
  }

  wrapMethod(query, renameFunc) {
    var rename = renameFunc;
    if (typeof (renameFunc) === 'string')
      rename = () => renameFunc;

    query = `${this.nativeName}::${query}`;
    var methods = nativeAPI.find(query, 'method');
    methods.forEach(method =>
      this.$wrapMethod(new Method.Configuration(rename(method.name), method.key)));
    return this;
  }

  wrapProperty(getterKey, setterKey, name) {
    if (name === undefined && setterKey === undefined) throw new Error('wrapper name cannot be undefined');
    if (name === undefined) {
      name = setterKey;
      setterKey = undefined;
    }

    var getterQuery = `${this.nativeName}::${getterKey}`;
    var getters = nativeAPI.find(getterQuery, 'method');
    if (getters.length > 1) throw new Error('multiple getters found');
    getterKey = getters[0].key;
    this.excludeByKey(getterKey);

    if (setterKey !== undefined) {
      var setterQuery = `${this.nativeName}::${setterKey}`;
      var setters = nativeAPI.find(setterQuery, 'method');
      if (setters.length > 1) throw new Error('multiple setters found');
      setterKey = setters[0].key;
      this.excludeByKey(setters[0].key);
    }

    this.members.push(new Property.Configuration(name, getterKey, setterKey));
    return this;
  }

  wrapConstructor(signature) {
    var ctorQuery = `${this.nativeName}::${this.nativeName}(${signature})`;
    var ctors = nativeAPI.find(ctorQuery, 'constructor')
      .filter(ctor => ctor.copyConstructor !== true);
    ctors.forEach(method =>
      this.$wrapMethod(new Constructor.Configuration(this.name, method.key)));
    return this;
  }

  getKeys() {
    return [this.nativeName];
  }
}

module.exports = {
  Configuration: ClassConfiguration,
  Definition: ClassDefinition
};
