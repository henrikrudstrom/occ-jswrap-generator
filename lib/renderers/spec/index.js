const base = require('../base.js');
const typemap = require('../../typemap.js');
const util = require('../../util.js');
const Factory =   require('../../factory.js');

class WrapperRenderer extends base.ContainerRenderer {
  constructor(def, factory) {
    super(def, factory);
    this.renderers = def.members
      .map(mod => factory.create(mod));
  }

  renderMain(content) {
    if (!content) content = {};
    return super.renderMain(content);
  }
}
WrapperRenderer.prototype.declType = 'wrapper';

class ModuleRenderer extends base.ContainerRenderer {
  constructor(def, factory) {
    super(def, factory);
    this.renderers = def.members.map(mod => factory.create(mod));
  }
}
ModuleRenderer.prototype.declType = 'module';

class EnumRenderer extends base.Renderer {
  constructor(def, factory) {
    super(def, factory);

    var nextInt = 0;
    this.nextInt = () => {
      var val = nextInt;
      nextInt = (nextInt + 1) % this.def.values.length;
      return val;
    };
  }

  renderNewValue() {
    var val = this.def.values[this.nextInt()].name;
    return `${this.def.parent.name}.${this.def.name}.${val}`;
  }
}
EnumRenderer.prototype.declType = 'enum';

module.exports = util.importAll(
  require('./class.js'),
  require('./callable.js'),
  require('./overload.js'),
  require('./collection.js'),
  EnumRenderer,
  ModuleRenderer,
  WrapperRenderer
);

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);

module.exports.create = function create(model) {
  return new Factory(module.exports.all, new typemap.Renderer()).create(model);
};
