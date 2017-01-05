const renderClassHeader = require('./render/cpp/classHeader.js');
const renderClassSource = require('./render/cpp/classSource.js');
const renderModuleSource = require('./render/cpp/moduleSource.js');
const renderCMake = require('./render/cmake.js');
const settings = require('./settings.js');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

function write(folder, filename, src) {
  mkdirp.sync(folder);
  fs.writeFileSync(path.join(folder, filename), src);
}

function writeHeader(mod, filename, src) {
  write(path.join(settings.paths.inc, mod), filename, src);
}

function writeSource(mod, filename, src) {
  write(path.join(settings.paths.src, mod), filename, src);
}

function renderWrapper(typemap) {
  var headerFiles = {};
  var sourceFiles = {};
  typemap.modules.forEach((mod) => {
    writeSource(mod.name, mod.name + '.cc', renderModuleSource(typemap, mod));
    mod.members.forEach((cls) => {
      writeHeader(mod.name, cls.name + '.h', renderClassHeader(typemap, cls));
      writeSource(mod.name, cls.name + '.cc', renderClassSource(typemap, cls));
    });
  });
  write('.', 'CMakeLists.txt', renderCMake(typemap));
  return { headerFiles, sourceFiles };
}

module.exports.wrapper = renderWrapper;
