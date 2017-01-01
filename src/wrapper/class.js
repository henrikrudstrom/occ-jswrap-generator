const ContainerConfiguration = require('./container.js').configuration;
const ContainerDefinition = require('./container.js').definition;
const MethodConfiguration = require('./method.js').configuration;
const PropertyConfiguration = require('./property.js').configuration;
const nativeAPI = require('../nativeAPI.js');
const definitions = require('./definitions.js');

class ClassDefinition extends ContainerDefinition {
  constructor(wrappedAPI, parent, conf) {
    super(wrappedAPI, parent, conf);
    this.classKey = conf.classKey;
    this.declType = 'class';
  }

  getKeys() {
    return [this.classKey];
  }
}

definitions.register('class', ClassDefinition);

class ClassConfiguration extends ContainerConfiguration {
  constructor(parent, name, key) {
    super(parent, name);
    this.classKey = key;
    this.declType = 'class';
  }

  wrapMethod(key, name) {
    var newMethod = new MethodConfiguration(this, name, key);
    var existingMember = this.getMemberByName(name);
    if (existingMember !== undefined) {
      existingMember.overload(key);
    } else
      this.declarations.push(newMethod);

    return this;
  }

  wrapMethods(query, renameFunc) {
    query = `${this.classKey}.${query}`;
    var methods = nativeAPI.get(query);
    this.declarations = this.declarations.concat(
      methods.map(method => new MethodConfiguration(this, renameFunc(method.name), method.key))
    );
    return this;
  }

  wrapProperty(getterKey, setterKey, name) {
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
