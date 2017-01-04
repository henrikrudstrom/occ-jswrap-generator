'use strict'
const Renderer = require('../renderer.js');

class ModuleRenderer extends Renderer {
  constructor(def) {
    super();
    this.definition = def;
    this.renderers = def.declarations.map(decl => factory.createRenderer(decl));
  }

  renderModuleImpl() {
    return `\
  #include <nan.h>
  ${this.emit('includeClass').join('\n')}

  NAN_MODULE_INIT(InitAll) {
    ${this.emit('moduleInitCall').join('\n')}
  }

  NODE_MODULE(NanObject, InitAll)
  `;
  }
}

factory.registerRenderer('module', ModuleRenderer);
