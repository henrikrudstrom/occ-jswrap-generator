const ModuleConfiguration = require('./module.js');
const ClassConfiguration = require('./class.js');
const nativeAPI = require('../nativeAPI.js');
const util = require('../util.js');

class CollectionConfiguration extends ClassConfiguration {
  constructor(name, key, containedType) {
    super(name, key);
    this.containedType = containedType;
  }

  static wrap(parent, query, containedType, newName) {
    var rename = util.renameClass;
    if (typeof (newName) === 'string')
      rename = () => newName;
    var res = nativeAPI.find(query);
    return res.map(decl => new CollectionConfiguration(
      rename(decl.name), decl.name, containedType));
  }
}
CollectionConfiguration.prototype.declType = 'collection';

function wrapArray1(parent, query, containedType) {
  const conf = CollectionConfiguration.wrap(parent, query, containedType);

  // manually create method objects as the parser cannot understand generic templates yet.
  // note, dont include index argument of accessor methods
  // TODO: index accessors where index is not first argument is not supported
  const setter = {
    name: 'SetValue',
    arguments: [{ name: 'value', type: containedType }],
    return: { type: 'void' }
  };
  const getter = {
    name: 'Value',
    arguments: [],
    return: { type: containedType }
  };
  conf.forEach((cls) => {
    cls.wrapIndexedProperty('Value', 'SetValue', 'value', getter, setter);
    cls.wrapConstructor({
      name: cls.nativeName.split('_')[1],
      arguments: [
        { name: 'Lower', type: 'Standard_Integer' },
        { name: 'Upper', type: 'Standard_Integer' }
      ],
      return: { type: cls.nativeName }
    });
  });

  return conf;
}

ModuleConfiguration.registerType('Collection', CollectionConfiguration.wrap);
ModuleConfiguration.registerType('Array1', wrapArray1);
