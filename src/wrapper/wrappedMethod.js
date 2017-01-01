const WrappedDeclaration = require('./base.js').WrappedDeclaration;

class WrappedMethod extends WrappedDeclaration {
  constructor(parent, name, methodKey) {
    super(parent, name);
    this.methodKey = methodKey;
  }
  getKeys() {
    return [this.methodKey];
  }
}

module.exports = WrappedMethod;
