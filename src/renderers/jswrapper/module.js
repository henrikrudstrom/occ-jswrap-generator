const Renderer = require('../renderer.js');

class ModuleRenderer extends Renderer {
  constructor(def, factory, typemap) {
    super();
    this.def = def;
    this.renderers = def.members.map(decl => factory.create(decl, typemap));
  }

  renderMain(files, parent){

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
