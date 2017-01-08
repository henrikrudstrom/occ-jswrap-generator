function renderModule(mod) {
  var modName = mod.name.toUpperCase();
  return `\
# Module ${modName}
file(GLOB ${modName}_SOURCE_FILES "./build/src/${mod.name}/*.cc")
add_library(${mod.name} SHARED \${${modName}_SOURCE_FILES})
set_target_properties(${mod.name} PROPERTIES PREFIX "" SUFFIX ".node")
target_include_directories(${mod.name} PRIVATE \${CMAKE_JS_INC})
target_link_libraries(${mod.name} \${CMAKE_JS_LIB})
target_link_libraries(${mod.name} common TKernel TKG2d TKG3d TKGeomBase TKMath)
`;
}

function renderCMake(wrappedAPI) {
  var targets = wrappedAPI.modules.map(renderModule).join('\n\n');
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

${targets}
`;
}

module.exports = renderCMake;
