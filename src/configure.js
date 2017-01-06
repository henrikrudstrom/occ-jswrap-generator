const Module = require('./model/module.js');
const Builtin = require('./model/builtin.js');
const Wrapper = require('../src/model/wrapper.js');

function builtInModule() {
  var mod = new Module.Configuration();
  mod.name = 'builtins';
  mod.members.push(new Builtin.Configuration('double', 'Standard_Real'));
  mod.members.push(new Builtin.Configuration('int', 'Standard_Integer'));
  mod.members.push(new Builtin.Configuration('bool', 'Standard_Boolean'));
  return mod;
}

function configure(...configurators) {
  var modules = configurators.map((fn) => {
    var mod = new Module.Configuration();
    fn(mod);
    return mod;
  }).concat(builtInModule());

  return new Wrapper.Configuration('occ-node', modules);
}

module.exports = configure;
