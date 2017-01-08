const base = require('../base.js');

class ModuleRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.renderers = def.members.map(cls => factory.create(cls, typemap));
  }

  renderMain(content) {
    content[`[src]/${this.def.name}/module.cc`] = this.renderModuleImpl();
    return super.renderMain(content);
  }

  renderModuleImpl() {
    return `\
  #include <nan.h>
  ${this.emit('renderIncludeClass').join('\n')}

  NAN_MODULE_INIT(InitAll) {
    ${this.emit('renderModuleInitCall').join('\n')}
  }

  NODE_MODULE(NanObject, InitAll)`;
  }

  renderCMake() {
    if (this.def.name === 'builtins') return '';
    var modName = this.def.name;
    return `\
# Module ${modName}
file(GLOB ${modName.toUpperCase()}_SOURCE_FILES "./src/${modName}/*.cc")
add_library(${modName} SHARED \${${modName.toUpperCase()}_SOURCE_FILES})
set_target_properties(${modName} PROPERTIES PREFIX "" SUFFIX ".node")
target_include_directories(${modName} PRIVATE \${CMAKE_JS_INC})
target_link_libraries(${modName} \${CMAKE_JS_LIB})
target_link_libraries(${modName} common TKernel TKG2d TKG3d TKGeomBase TKMath)`;
  }
}
ModuleRenderer.prototype.declType = 'module';
module.exports = ModuleRenderer;
