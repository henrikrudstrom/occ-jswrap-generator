'use strict'
const createRegexp = require('./../util.js').createRegexp;
const DeclarationDefinition = require('./declaration.js');
const upperCamelCase = require('uppercamelcase');

function matchDeclByKey(exp) {
  return decl => decl.getKeys().every(k => exp.test(k));
}

function matchDeclByName(exp) {
  return decl => exp.test(decl.name);
}

function not(fn) {
  return decl => !fn(decl);
}

var containerMixin = Base => class extends Base {
  getMembersByName(name) {
    var exp = createRegexp(name);
    return this.members.filter(matchDeclByName(exp));
  }

  getMemberByName(name) {
    var res = this.getMembersByName(name);
    if (res.length > 1) throw new Error(`Found multiple members matching name '${name}' in ${this.name}, found ${res.map(d => d.name)}`);
    if (res.length === 0) return undefined;
    return res[0];
  }

  getMembersByKey(key) {
    var exp = createRegexp(key);
    return this.members.filter(matchDeclByKey(exp));
  }

  getMemberByKey(key) {
    var res = this.getMembersByKey(key);
    if (res.length > 1) throw new Error(`Found multiple members matching name '${key}' in  ${this.name}, found ${res.map(d => d.getKeys())}`);
    if (res.length === 0) return undefined;
    return res[0];
  }
};

class ContainerDefinition extends containerMixin(DeclarationDefinition) {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.members = conf.members.map(decl =>
      factory.create(decl, this, typemap));
  }
}

module.exports = ContainerDefinition;