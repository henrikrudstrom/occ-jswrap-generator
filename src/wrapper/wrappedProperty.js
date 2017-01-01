const WrappedDeclaration = require('./base.js').WrappedDeclaration;

class WrappedProperty extends WrappedDeclaration {
  constructor(parent, name, getterKey, setterKey) {
    super(parent, name);
    this.getterKey = getterKey;
    this.setterKey = setterKey;
  }

  getKeys() {
    return [this.setterKey, this.getterKey];
  }
}

module.exports = WrappedProperty;
