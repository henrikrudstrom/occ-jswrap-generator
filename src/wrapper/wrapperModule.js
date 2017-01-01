const WrappedContainer = require('./base.js').WrappedContainer;
const WrappedClass = require('./wrappedClass.js');
const nativeAPI = require('../nativeAPI.js');


class WrapperModule extends WrappedContainer {
  constructor(parent) {
    super(parent, 'unnamed-module');
  }

  wrapClass(clsKey, name) {
    var cls = this.getMemberByKey(clsKey);
    if (cls !== undefined) {
      throw new Error(`Class '${clsKey} has already been wrapped'`);
    }
    cls = new WrappedClass(this, name, clsKey);
    this.declarations.push(cls);
    return cls;
  }

  wrapClasses(query, fn) {
    var res = nativeAPI.get(query);
    res.forEach(decl => this.wrapClass(decl.name, fn(decl.name)));
  }
}

module.exports = WrapperModule;
