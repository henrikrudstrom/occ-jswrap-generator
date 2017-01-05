const Module = require('./model/module.js');
const Builtin = require('./model/builtin.js');
const WrappedAPI = require('./wrappedAPI.js');
const settings = require('./settings.js');
const path = require('path');
const glob = require('glob');
const Wrapper = require('./model/wrapper.js');

function loadConfig(file) {
  file = path.relative(__dirname, file);
  return require(file); // eslint-disable-line global-require
}

function getConfigurators() {
  return glob.sync(`${settings.paths.definition}/*.js`).map(loadConfig);
}

function builtInModule() {
  var mod = new Module.Configuration();
  mod.name = 'builtins';
  mod.members.push(new Builtin.Configuration('double', 'Standard_Real'));
  mod.members.push(new Builtin.Configuration('int', 'Standard_Integer'));
  mod.members.push(new Builtin.Configuration('bool', 'Standard_Boolean'));
  return mod;
}

function configure(configurators) {
  if (configurators === undefined)
    configurators = getConfigurators();
  if (!Array.isArray(configurators)) configurators = [configurators];
  var modules = configurators.map((fn) => {
    var mod = new Module.Configuration();
    fn(mod);
    return mod;
  }).concat(builtInModule());

  return new Wrapper.Configuration('occ-node', modules);
}

module.exports = configure;
