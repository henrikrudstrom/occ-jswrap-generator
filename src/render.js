const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const definitions = require('./definition');

const Factory = require('./factory.js');

module.exports = function render(configuration, renderers) {
  var model = new Factory.Definition(definitions.all).create(configuration);
  var renderer = new Factory.Renderer(renderers).create(model);

  return renderer.renderMain();
};

module.exports.write = function write(content, settings) {
  var paths = {
    '[inc]': settings.paths.inc,
    '[src]': settings.paths.src,
    '[root]': '.'
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
};
