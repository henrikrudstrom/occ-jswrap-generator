const camelCase = require('camel-case');

module.exports.renameClass = function renameClass(name) {
  return name.split('_')[1];
};

module.exports.renameMember = camelCase;


var replaceAll = function(target, search, replacement) {
  return target.split(search).join(replacement);
};

module.exports.createRegexp = function createRegexp(exp) {
  exp = exp.replace('(', '\\(');
  exp = exp.replace(')', '\\)');

  exp = replaceAll(exp, '*', '[a-zA-Z0-9,_ ]*');
  return new RegExp('^' + exp + '$');
};

module.exports.groupBy = function groupBy(arr, fn, initial) {
  var grouped = initial || [];
  function add(value, group) {
    if (grouped[group] === undefined)
      grouped[group] = [];
    grouped[group].push(value);
  }
  arr.forEach((value, index) => add(value, fn(value, index)));
  return grouped;
};


module.exports.matchByKey = function matchByKey(exp) {
  return decl => decl.getKeys().every(k => exp.test(k));
};

module.exports.match = function match(exp) {
  return decl => exp.test(decl.name);
};

module.exports.not = function not(fn) {
  return decl => !fn(decl);
};
