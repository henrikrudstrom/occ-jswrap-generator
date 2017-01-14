const ModuleConfiguration = require('./module.js');
const ConfigurationBase = require('./base.js');
const nativeAPI = require('../nativeAPI.js');


class CollectionConfiguration extends ConfigurationBase {
  constructor(name, nativeName, containerType, containedType) {
    super(name);
    this.nativeName = nativeName;
    this.containerType = containerType;
    this.containedType = containedType;
    this.isType = true;
  }
  static wrap(parent, query, name, containerType, containedType) {
    var res = nativeAPI.get(query);
    return new CollectionConfiguration(name, res.name, containerType, containedType);
  }
}
CollectionConfiguration.prototype.declType = 'collection';

ModuleConfiguration.registerType('Collection', CollectionConfiguration.wrap);
