function renderModuleSource(typemap, mod) {
  var includes = mod.members
    .map(cls => `#include <${mod.name}/${cls.name}.h>`)
    .join('\n');

  var inits = mod.members
    .map(cls => `  ${cls.qualifiedName}::Init(target);`)
    .join('\n  ');

  return `\
#include <nan.h>
${includes}

NAN_MODULE_INIT(InitAll) {
  ${inits}
}

NODE_MODULE(NanObject, InitAll)
`;
}

module.exports = renderModuleSource;
