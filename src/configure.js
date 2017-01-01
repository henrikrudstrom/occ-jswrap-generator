const WrapperModule = require('./wrapper/wrapperModule.js');
const WrappedAPI = require('./wrappedAPI.js');

function configure(configurations) {
  if (!Array.isArray(configurations)) configurations = [configurations];
  var modules = configurations.map((fn) => {
    var mod = new WrapperModule();
    fn(mod);
    return mod;
  });
  return new WrappedAPI(modules);
}

module.exports = configure;
