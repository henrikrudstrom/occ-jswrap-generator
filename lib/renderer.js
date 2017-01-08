const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const typemap = require('./typemap');
const Factory = require('./factory.js');

function create(model, renderers) {
  return new Factory(renderers, new typemap.Renderer()).create(model);
}

function render(model, renderers) {
  return create(model, renderers).renderMain();
}

function write(content, settings) {
  var paths = {
    '[inc]': settings.paths.inc,
    '[src]': settings.paths.src,
    '[build]': settings.paths.build,
    '[lib]': settings.paths.build + '/lib'
  };

  function replace(filename) {
    Object.keys(paths).forEach((pth) => {
      filename = filename.replace(pth, paths[pth]);
    });
    return filename;
  }
  Object.keys(content).forEach((file) => {
    var fullFilename = replace(file);
    mkdirp.sync(path.dirname(fullFilename));
    fs.writeFileSync(fullFilename, content[file]);
  });
}

module.exports = { create, render, write };
