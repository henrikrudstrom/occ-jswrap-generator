const ModuleConfiguration = require('./wrapper/module.js').configuration;
const WrappedAPI = require('./wrappedAPI.js');
const settings = require('./settings.js');
const path = require('path');
const glob = require('glob');


function loadConfig(file) {
  file = path.relative(__dirname, file);
  return require(file); // eslint-disable-line global-require
}

function getConfigurations() {
  return glob.sync(`${settings.paths.definition}/*.js`).map(loadConfig);
}

function configure(configurations) {
  if (configurations === undefined)
    configurations = getConfigurations();
  if (!Array.isArray(configurations)) configurations = [configurations];
  var modules = configurations.map((fn) => {
    var mod = new ModuleConfiguration();
    fn(mod);
    return mod;
  });
  return new WrappedAPI(modules);
}

module.exports = configure;
