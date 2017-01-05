const createRegexp = require('./../util.js').createRegexp;
const Declaration = require('./declaration.js');
const upperCamelCase = require('uppercamelcase');

function matchDeclByKey(exp) {
  return decl => decl.getKeys().every(k => exp.test(k));
}

function matchDeclByName(exp) {
  return decl => {
    return exp.test(decl.name);
  }
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

class ContainerDefinition extends containerMixin(Declaration.Definition) {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
    this.members = conf.members.map(decl =>
      factory.createDefinition(decl, parent, typemap));
  }
}


class ContainerConfiguration extends containerMixin(Declaration.Configuration) {
  constructor(name, declType) {
    super(name, declType);
    this.members = [];
  }

  excludeByKey(key) {
    var exp = createRegexp(key);
    this.members = this.members.filter(not(matchDeclByKey(exp)));
    return this;
  }

  excludeByName(key) {
    var exp = createRegexp(key);
    this.members = this.members.filter(not(matchDeclByName(exp)));
    return this;
  }

  rename(name, newName) {
    var decl = this.getMemberByName(name);
    decl.name = newName;
    return this;
  }
  
  static registerType(typename, fn) {
    this.prototype[`wrap${upperCamelCase(typename)}`] = function(...args){
      return this.wrap(fn, ...args);
    }
  } 

  wrap(fn, ...rest) {
    var conf = fn(this, ...rest.slice(0, fn.length - 1))
    var cb = rest[fn.length-1];
    if(cb) cb(conf);
    if(!Array.isArray(conf)) conf = [conf];

    this.members = this.members.concat(conf);
    return this;
  }
}

module.exports = {
  Configuration: ContainerConfiguration,
  Definition: ContainerDefinition
};
