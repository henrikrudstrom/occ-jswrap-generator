const ContainerConfiguration = require('./container.js').configuration;
const ContainerDefinition = require('./container.js').definition;
const ClassConfiguration = require('./class.js').configuration;
const nativeAPI = require('../nativeAPI.js');
const definitions = require('./definitions.js');

class ModuleDefinition extends ContainerDefinition {
  constructor(wrapperAPI, parent, conf) {
    super(wrapperAPI, parent, conf);
    this.declType = conf.declType;
  }
}

definitions.register('module', ModuleDefinition);

class ModuleConfiguration extends ContainerConfiguration {
  constructor(parent) {
    super(undefined, 'unnamed-module');
    this.declType = 'module';
  }

  wrapClass(clsKey, name) {
    var cls = this.getMemberByKey(clsKey);
    if (cls !== undefined) {
      throw new Error(`Class '${clsKey} has already been wrapped'`);
    }
    cls = new ClassConfiguration(this, name, clsKey);
    this.declarations.push(cls);
    return cls;
  }

  wrapClasses(query, fn) {
    var res = nativeAPI.get(query);
    res.forEach(decl => this.wrapClass(decl.name, fn(decl.name)));
  }

  toDefinition(wrapperAPI, parent) {
    return new ModuleDefinition(wrapperAPI, parent, this);
  }
}

module.exports = {
  configuration: ModuleConfiguration,
  definition: ModuleDefinition
};
