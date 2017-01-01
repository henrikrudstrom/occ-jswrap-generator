const ModuleConfiguration = require('./wrapper/module.js').configuration;
const WrappedAPI = require('./wrappedAPI.js');

function configure(configurations) {
  if (!Array.isArray(configurations)) configurations = [configurations];
  var modules = configurations.map((fn) => {
    var mod = new ModuleConfiguration();
    fn(mod);
    return mod;
  });
  return new WrappedAPI(modules);
}

module.exports = configure;
