const Renderer = require('../renderer.js');

class WrapperRenderer extends Renderer {
  constructor(def, factory) {
    super();
    this.def = def;
    this.renderers = def.members.map(mod => factory.create(mod, factory));
  }

  static register() {
    return 'wrapper';
  }

  renderMain(files, parent) {
    super.renderMain(files, parent);
    files['CMakeLists.txt'] = this.renderCMake();
  }

  renderCMake() {
    return `\
cmake_minimum_required(VERSION 2.8)

# Name of the project (will be the name of the plugin)
project("opencascade-js")

include_directories("./build/inc")
include_directories("/usr/local/include/opencascade")
link_directories("/usr/local/lib")

# common runtime
file(GLOB COMMON_SOURCE_FILES "./build/src/common/*.cc")
add_library(common SHARED \${COMMON_SOURCE_FILES})
set_target_properties(common PROPERTIES PREFIX "" SUFFIX ".node")
target_include_directories(common PRIVATE \${CMAKE_JS_INC})
target_link_libraries(common \${CMAKE_JS_LIB})

${this.emit('CMake').join('\n\n')}
  `;
  }
}
