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

module.exports.match = function match(exp) {
  return decl => exp.test(decl.name);
};

module.exports.not = function not(fn) {
  return decl => !fn(decl);
};

module.exports.importAll = function importAll(...modules){
  var exports = {};
  function addCtor(ctor){
    if(exports[ctor.name])
      throw Error('duplicate key ' + ctor.name + 'while creating module.');
    exports[ctor.name] = ctor;
  }
  modules.forEach(mod => {
    if(typeof(mod) === 'function')
      addCtor(mod)
    Object.keys(mod).forEach((key) => addCtor(mod[key]))
  })
  return exports
}