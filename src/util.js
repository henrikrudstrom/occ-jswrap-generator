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
  
  exp = replaceAll(exp, '*', '[a-zA-Z0-9]*');
  return new RegExp('^' + exp + '$');
};
