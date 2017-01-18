const createRegexp = require('./../util.js').createRegexp;
const ConfigurationBase = require('./base.js');
const upperCamelCase = require('uppercamelcase');
const util = require('../util.js');
const containerMixin = require('../containerMixin.js');

class ContainerConfiguration extends containerMixin(ConfigurationBase) {
  constructor(name) {
    super(name);
    this.members = [];
  }

  containerMixinGetChildren() {
    return this.members;
  }

  exclude(key) {
    var exp = createRegexp(key);
    this.members = this.members.filter(util.not(util.match(exp)));
    return this;
  }

  rename(name, newName) {
    var decl = this.getMember(name);
    decl.name = newName;
    return this;
  }

  // makes function available as `this.wrap<name>(args, callback)`
  // callback is called for every object returned by `fn`
  static registerType(name, fn) {
    this.prototype[`wrap${upperCamelCase(name)}`] = function (...args) {
      return this.wrap(fn, ...args);
    };
  }

  wrap(fn, ...rest) {
    var members = fn(this, ...rest.slice(0, fn.length - 1));
    if (!Array.isArray(members)) members = [members];

    // execute callback function to access wrapped result
    var cb = rest[fn.length - 1];
    if (cb) members.forEach(cb);
    members.forEach(member => this.exclude(member.name));
    this.members = this.members.concat(members);
    return this;
  }
}

module.exports = ContainerConfiguration;
