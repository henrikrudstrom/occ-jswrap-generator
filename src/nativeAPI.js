const glob = require('glob');
const fs = require('fs');
const settings = require('./settings.js').initialize();
const createRegexp = require('./util.js').createRegexp;

var modules = [];
var lookup = {};
var loaded = false;
function load() {
  if (loaded) return;

  modules = glob.sync(`./${settings.paths.cache}/headers/*.json`).map(file =>
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

function get(key) {
  var result = lookup[key];
  if (result !== undefined)
    return result;
  var res = [];
  var exp = createRegexp(key);
  for (var k in lookup) {
    if (Object.prototype.hasOwnProperty.call(lookup, k))
      if (exp.test(k) || exp.test(k.split('(')[0]))
        res.push(lookup[k]);
  }
  if (res.length > 0)
    return res;
  return undefined;
}

load();

module.exports = { get };
