const Container = require('./container.js');
const Class = require('./class.js');
const nativeAPI = require('../nativeAPI.js');

class ModuleDefinition extends Container.Definition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);
  }

}
ModuleDefinition.prototype.type = 'module';

class ModuleConfiguration extends Container.Configuration {
  constructor(name) {
    super(name || 'unnamed-module');
  }


  wrapClass(clsKey, name) {
    var cls = this.getMemberByKey(clsKey);
    if (cls !== undefined) {
      throw new Error(`Class '${clsKey} has already been wrapped'`);
    }
    cls = new Class.Configuration(name, clsKey);
    this.members.push(cls);
    return cls;
  }

  wrapClasses(query, fn) {
    var res = nativeAPI.find(query);
    res.forEach(decl => this.wrapClass(decl.name, fn(decl.name)));
  }
}
ModuleConfiguration.prototype.type = 'module';

module.exports = {
  Configuration: ModuleConfiguration,
  Definition: ModuleDefinition
};
