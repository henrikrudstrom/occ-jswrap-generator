const base = require('../base.js');
const Factory = require('../../factory.js');
const typemap = require('../../typemap.js');

class WrapperRenderer extends base.ContainerRenderer {
  constructor(def, factory) {
    super(def, factory);
    this.renderers = def.members.map(mod => factory.create(mod));
  }
}
WrapperRenderer.prototype.declType = 'wrapper';

class ModuleRenderer extends base.Renderer {
  renderMain(content) {
    if (!content) content = {};
    content[`[lib]/${this.def.name}.js`] = this.renderModule();
    console.log('content', content);
    return content;
  }

  renderModule() {
    return `module.exports = require('bindings')('${this.def.name}.node');`;
  }
}
ModuleRenderer.prototype.declType = 'module';


module.exports = {
  WrapperRenderer,
  ModuleRenderer
};

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);

module.exports.create = function create(model) {
  return new Factory(module.exports.all, new typemap.Renderer()).create(model);
};
