const createRegexp = require('./../util.js').createRegexp;

function matchDeclByKey(exp) {
  return decl => decl.getKeys().every(k => exp.test(k));
}

function matchDeclByName(exp) {
  return decl => exp.test(decl.name);
}

function not(fn) {
  return decl => !fn(decl);
}

class WrappedDeclaration {
  constructor(parent, name) {
    this.parent = parent;
    this.name = name;
  }
}

class WrappedContainer extends WrappedDeclaration {
  constructor(parent, name) {
    super(parent, name);
    this.declarations = [];
  }

  excludeByKey(key) {
    var exp = createRegexp(key);
    this.declarations = this.declarations.filter(not(matchDeclByKey(exp)));
    return this;
  }

  excludeByName(key) {
    var exp = createRegexp(key);
    this.declarations = this.declarations.filter(not(matchDeclByName(exp)));
    return this;
  }

  rename(name, newName) {
    var decl = this.getMemberByName(name);
    decl.name = newName;
    return this;
  }

  getMembersByName(name) {
    var exp = createRegexp(name);
    return this.declarations.filter(matchDeclByName(exp));
  }

  getMemberByName(name) {
    var res = this.getMembersByName(name);
    if (res.length > 1) throw new Error(`Found multiple members matching name '${name}' in ${this.name}, found ${res.map(d => d.name)}`);
    if (res.length === 0) return undefined;
    return res[0];
  }

  getMembersByKey(key) {
    var exp = createRegexp(key);
    return this.declarations.filter(matchDeclByKey(exp));
  }

  getMemberByKey(key) {
    var res = this.getMembersByKey(key);
    if (res.length > 1) throw new Error(`ound multiple members matching name '${key}' in  ${this.name}, found ${res.map(d => d.getKeys())}`);
    if (res.length === 0) return undefined;
    return res[0];
  }
}

module.exports = {
  WrappedDeclaration, WrappedContainer
};
