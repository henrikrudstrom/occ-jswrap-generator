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
  ${this.emit('includeClass').join('\n')}

  NAN_MODULE_INIT(InitAll) {
    ${this.emit('moduleInitCall').join('\n')}
  }

  NODE_MODULE(NanObject, InitAll)`;
  }

  renderCMake(mod) {
    var modName = this.def.name.toUpperCase();
    return `\
# Module ${modName}
file(GLOB ${modName}_SOURCE_FILES "./build/src/${mod.name}/*.cc")
add_library(${mod.name} SHARED \${${modName}_SOURCE_FILES})
set_target_properties(${mod.name} PROPERTIES PREFIX "" SUFFIX ".node")
target_include_directories(${mod.name} PRIVATE \${CMAKE_JS_INC})
target_link_libraries(${mod.name} \${CMAKE_JS_LIB})
target_link_libraries(${mod.name} common TKernel TKG2d TKG3d TKGeomBase TKMath)`;
  }
}
ModuleRenderer.prototype.type = 'module';
module.exports = ModuleRenderer;
