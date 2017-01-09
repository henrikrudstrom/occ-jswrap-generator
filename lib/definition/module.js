const ContainerDefinition = require('./container.js');
const nativeAPI = require('../nativeAPI.js');


class ModuleDefinition extends ContainerDefinition {
  constructor(conf, factory, typemap, parent) {
    super(conf, factory, typemap, parent);

    if (this.name === 'builtins') return;
    this.members = this.members.sort((a, b) => {
      var lvlA = a.getBaseLevel();
      var lvlB = b.getBaseLevel();
      if (lvlA === lvlB) return a.name > b.name;
      return lvlA - lvlB;
    });
  }
  
  getDependencies() {
    return this.members
      .map(member => member.getWrappedDependencies())
      .reduce((a, b) => a.concat(b), [])
      .map(member => member.parent)
      .filter((obj, index, array) => array.indexOf(obj) === index)
      .filter(mod => mod !== this);
    
  }

}
ModuleDefinition.prototype.declType = 'module';

module.exports = ModuleDefinition;
