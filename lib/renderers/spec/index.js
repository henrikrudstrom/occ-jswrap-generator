const base = require('../base.js');
const Factory = require('../../factory.js');
const typemap = require('../../typemap.js');
const ClassRenderer = require('./class.js');


class WrapperRenderer extends base.ContainerRenderer {
  constructor(def, factory) {
    super(def, factory);
    this.renderers = def.members
      .filter(mod => mod.name !== 'builtins')
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


module.exports = {
  WrapperRenderer,
  ModuleRenderer,
  ClassRenderer
};

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);

module.exports.create = function create(model) {
  return new Factory(module.exports.all, new typemap.Renderer()).create(model);
};
