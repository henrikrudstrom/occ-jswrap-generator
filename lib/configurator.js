const configuration = require('./configuration');
const definition = require('./definition');
const Factory = require('./factory.js');
const typemap = require('./typemap.js');

function builtInModule() {
  var mod = new configuration.Module();
  mod.name = 'builtins';
  mod.members.push(new configuration.Builtin('double', 'Number', 'Standard_Real'));
  mod.members.push(new configuration.Builtin('uint32_t', 'Number', 'Standard_Integer'));
  mod.members.push(new configuration.Builtin('bool', 'Boolean', 'Standard_Boolean'));
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

function createModel(config) {
  return new Factory(definition.all, new typemap.Definition()).create(config);
}

module.exports.configure = configure;
module.exports.createModel = createModel;
