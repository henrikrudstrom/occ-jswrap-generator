const Container = require('./container.js');
const Class = require('./class.js');
const nativeAPI = require('../nativeAPI.js');
const factory = require('../factory.js');


class ModuleDefinition extends Container.Definition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
    this.declType = conf.declType;
  }
}

factory.registerDefinition('module', ModuleDefinition);

class ModuleConfiguration extends Container.Configuration {
  constructor(name) {
    super(name || 'unnamed-module');
    this.declType = 'module';
  }

  wrapClass(clsKey, name) {
    var cls = this.getMemberByKey(clsKey);
    if (cls !== undefined) {
      throw new Error(`Class '${clsKey} has already been wrapped'`);
    }
    cls = new Class.Configuration(name, clsKey);
    this.declarations.push(cls);
    return cls;
  }

  wrapClasses(query, fn) {
    var res = nativeAPI.find(query);
    res.forEach(decl => this.wrapClass(decl.name, fn(decl.name)));
  }
}

module.exports = {
  Configuration: ModuleConfiguration,
  Definition: ModuleDefinition
};
