const configuration = require('./configuration');

function builtInModule() {
  var mod = new configuration.Module();
  mod.name = 'builtins';
  mod.members.push(new configuration.Builtin('double', 'Standard_Real'));
  mod.members.push(new configuration.Builtin('int', 'Standard_Integer'));
  mod.members.push(new configuration.Builtin('bool', 'Standard_Boolean'));
  return mod;
}

function configure(...configurators) {
  var modules = configurators.map((fn) => {
    var mod = new configuration.Module();
    fn(mod);
    return mod;
  }).concat(builtInModule());

  return new configuration.Wrapper('occ-node', modules);
}

module.exports = configure;
