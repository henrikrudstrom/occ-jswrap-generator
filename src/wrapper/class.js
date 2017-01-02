const ContainerConfiguration = require('./container.js').configuration;
const ContainerDefinition = require('./container.js').definition;
const MethodConfiguration = require('./method.js').configuration;
const PropertyConfiguration = require('./property.js').configuration;
const nativeAPI = require('../nativeAPI.js');
const definitions = require('./definitions.js');

class ClassDefinition extends ContainerDefinition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
    this.classKey = conf.classKey;
    this.declType = 'class';
    this.hasHandle = conf.hasHandle;
    this.qualifiedName = `${this.parent.name}::${this.name}`;
    this.dotOrArrow = this.hasHandle ? '->' : '.';
    this.nativeClass = nativeAPI.get(this.classKey);
  }

  getWrappedDependencies() {
    return this.declarations
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
    return this.wrapperAPI.getWrappedType(this.getNativeBaseClass());
  }

  getKeys() {
    return [this.classKey];
  }
}

definitions.register('class', ClassDefinition);

function hasHandle(nativeCls) {
  if (nativeCls === undefined) return false;
  if (nativeCls.bases === undefined) return false;
  if (nativeCls.bases.length < 1) return false;
  if (nativeCls.bases[0].name === 'Standard_Transient') return true;
  return hasHandle(nativeAPI.get(nativeCls.bases[0].name));
}

class ClassConfiguration extends ContainerConfiguration {
  constructor(parent, name, key) {
    super(parent, name);
    this.classKey = key;
    this.declType = 'class';
    this.hasHandle = hasHandle(nativeAPI.get(key));

  }

  $wrapMethod(key, name) {
    if (name === undefined) throw new Error('wrapper name cannot be undefined');
    var newMethod = new MethodConfiguration(this, name, key);
    var existingMember = this.getMemberByName(name);
    if (existingMember !== undefined) {
      existingMember.overload(key);
    } else
      this.declarations.push(newMethod);

    return this;
  }

  wrapMethod(query, renameFunc) {
    var rename = renameFunc;
    if (typeof (renameFunc) === 'string')
      rename = name => renameFunc;

    query = `${this.classKey}::${query}`;
    var methods = nativeAPI.get(query);
    methods.forEach(method => this.$wrapMethod(method.key, rename(method.name)));
    return this;
  }

  wrapProperty(getterKey, setterKey, name) {
    if (name === undefined && setterKey === undefined) throw new Error('wrapper name cannot be undefined');
    if (name === undefined) {
      name = setterKey;
      setterKey = undefined;
    }

    var getterQuery = `${this.classKey}::${getterKey}`;
    var getters = nativeAPI.get(getterQuery);
    if (getters.length > 1) throw new Error('multiple getters found');
    getterKey = getters[0].key;
    this.excludeByKey(getterKey);

    if (setterKey !== undefined) {
      var setterQuery = `${this.classKey}::${setterKey}`;
      var setters = nativeAPI.get(setterQuery);
      if (setters.length > 1) throw new Error('multiple setters found');
      setterKey = setters[0].key;
      this.excludeByKey(setters[0].key);
    }

    this.declarations.push(new PropertyConfiguration(this, name, getterKey, setterKey));
    return this;
  }

  getKeys() {
    return [this.classKey];
  }
}

module.exports = {
  configuration: ClassConfiguration,
  definition: ClassDefinition
};
