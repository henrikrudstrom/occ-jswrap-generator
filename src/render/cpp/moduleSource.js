function renderModuleSource(wrapperAPI, mod) {
  var includes = mod.declarations
    .map(cls => `#include <${mod.name}/${cls.name}.h>`)
    .join('\n');

  var inits = mod.declarations
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
