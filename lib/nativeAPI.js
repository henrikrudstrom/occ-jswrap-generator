const glob = require('glob');
const fs = require('fs');
const settings = require('./settings.js').initialize();
const createRegexp = require('./util.js').createRegexp;

var modules = [];
var lookup = {};
var loaded = false;

function load() {
  if (loaded) return;

  modules = glob.sync(`./${settings.paths.headerCache}/*.json`).map(file =>
    JSON.parse(fs.readFileSync(file))
  );

  modules.forEach((mod) => {
    mod.declarations.forEach((decl) => {
      if (decl.key)
        lookup[decl.key] = decl;
      if (!decl.declarations) return;
      decl.declarations.forEach((mem) => {
        if (mem.key)
          lookup[mem.key] = mem;
      });
    });
  });

  loaded = true;
}

function find(key, type) {
  var result = lookup[key];
  if (result !== undefined)
    return [result];
  var res = [];
  var exp = createRegexp(key);
  Object.keys(lookup).forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(lookup, k))
      if (exp.test(k) || exp.test(k.split('(')[0]))
        res.push(lookup[k]);
  });
  if (res.length === 0)
    return undefined;

  if (type)
    return res.filter(decl => decl.declType === type);

  return res;
}

function get(key, type) {
  var result = find(key, type);
  if (result === undefined) return result;
  if (result.length > 1) throw new Error('Excepted one result, got multiple');
  return result[0];
}

load();

module.exports = { 'get': get, 'find': find };
