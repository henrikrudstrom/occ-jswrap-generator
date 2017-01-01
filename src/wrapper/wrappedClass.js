const WrappedContainer = require('./base.js').WrappedContainer;
const WrappedMethod = require('./wrappedMethod.js');
const WrappedProperty = require('./wrappedProperty.js');
const nativeAPI = require('../nativeAPI.js');

class WrappedClass extends WrappedContainer {
  constructor(parent, name, key) {
    super(parent, name);
    this.classKey = key;
  }

  wrapMethod(key, name) {
    var newMethod = new WrappedMethod(this, name, key);
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
      methods.map(method => new WrappedMethod(this, renameFunc(method.name), method.key))
    );
    return this;
  }

  wrapProperty(getterKey, setterKey, name) {
    this.declarations.push(new WrappedProperty(this, name, getterKey, setterKey));
    return this;
  }

  getKeys() {
    return [this.classKey];
  }
}

module.exports = WrappedClass;
