const ContainerDefinition = require('./container.js');
const nativeAPI = require('../nativeAPI.js');


class ModuleDefinition extends ContainerDefinition {
  constructor(conf, parent, factory, typemap) {
    super(conf, parent, factory, typemap);

    if (this.name === 'builtins') return;
    this.members = this.members.sort((a, b) => {
      var lvlA = a.getBaseLevel();
      var lvlB = b.getBaseLevel();
      if (lvlA === lvlB) return a.name > b.name;
      return lvlA - lvlB;
    });
  }

}
ModuleDefinition.prototype.type = 'module';

module.exports = ModuleDefinition;
