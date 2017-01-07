const util = require('./util.js');


module.exports = Base => class extends Base {
  containerMixinGetObject(obj) {
    return obj;
  }

  getMembers(name) {
    var exp = util.createRegexp(name);
    return this.containerMixinGetChildren()
      .filter(child => util.match(exp)(this.containerMixinGetObject(child)));
  }

  getMember(name) {
    var res = this.getMembers(name);
    if (res.length > 1) throw new Error(`Found multiple members matching name '${name}' in ${this.name}, found ${res.map(d => d.name)}`);
    if (res.length === 0) return undefined;
    return res[0];
  }

  getMembersByKey(key) {
    var exp = util.createRegexp(key);
    return this.containerMixinGetChildren().filter(child => util.matchByKey(exp)(this.containerMixinGetObject(child)));
  }

  getMemberByKey(key) {
    var res = this.getMembersByKey(key);
    if (res.length > 1) throw new Error(`Found multiple members matching name '${key}' in  ${this.name}, found ${res.map(d => d.getKeys())}`);
    if (res.length === 0) return undefined;
    return res[0];
  }
};
