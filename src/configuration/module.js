const ContainerConfiguration = require('./container.js');
const ClassConfiguration = require('./class.js');
const nativeAPI = require('../nativeAPI.js');

class ModuleConfiguration extends ContainerConfiguration {
  constructor(name) {
    super(name || 'unnamed-module');
  }

  wrapClass(clsKey, name) {
    var cls = this.getMemberByKey(clsKey);
    if (cls !== undefined) {
      throw new Error(`Class '${clsKey} has already been wrapped'`);
    }
    cls = new ClassConfiguration(name, clsKey);
    this.members.push(cls);
    return cls;
  }

  wrapClasses(query, fn) {
    var res = nativeAPI.find(query);
    res.forEach(decl => this.wrapClass(decl.name, fn(decl.name)));
  }
}
ModuleConfiguration.prototype.type = 'module';

module.exports = ModuleConfiguration;
