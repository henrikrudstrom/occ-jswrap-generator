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
    let callback = () => {};
    let args = rest;
    if (typeof (rest[rest.length - 1]) === 'function') {
      callback = rest[rest.length - 1];
      args = rest.slice(0, rest.length - 1);
    }

    var members = fn(this, ...args);
    if (!Array.isArray(members)) members = [members];

    // execute callback function to access wrapped result
    members.forEach(callback);
    members.forEach((member) => {
      const existingMember = this.getMember(member.name);
      if (existingMember && typeof (member.addOverloads) === 'function') {
        member.addOverloads(existingMember);
      }
      this.exclude(member.name);
    });
    this.members = this.members.concat(members);
    return this;
  }
}

module.exports = ContainerConfiguration;
