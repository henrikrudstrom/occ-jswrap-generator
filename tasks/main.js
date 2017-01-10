const clean = require('gulp-clean');
const glob = require('glob');
const run = require('gulp-run');
const runSequence = require('run-sequence');
const path = require('path');
const rename = require('gulp-rename');
const mkdirp = require('mkdirp');
const fs = require('fs');
const beautify = require('gulp-beautify');
const filelog = require('gulp-filelog');

const configurator = require('../lib/configurator.js');
const settings = require('../lib/settings.js');

function loadConfig(file) {
  file = path.relative(__dirname, file);
  return require(file); // eslint-disable-line global-require
}

function getConfigurators() {
  return glob.sync(`${settings.paths.definition}/**/configure.js`).map(loadConfig);
}

function write(content) {
  var paths = {
    '[inc]': settings.paths.inc,
    '[src]': settings.paths.src,
    '[build]': settings.paths.build,
    '[lib]': settings.paths.build + '/lib',
    '[spec]': settings.paths.build + '/spec'
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

function render(model, rendererName) {
  var renderer = require('../lib/renderers/' + rendererName).create(model);
  var content = renderer.renderMain();
  write(content);
}


const jsWrapperRenderers = require('../lib/renderers/jswrapper');
const jsRenderers = require('../lib/renderers/js');

module.exports = function (gulp) {
  require('../lib/parse/parse.js')(gulp);
  require('./generator-tests.js');

  gulp.task('configure', () => {

  });

  gulp.task('render', (done) => {
    runSequence('clean-wrapper', 'copy-headers', 'render-wrapper', 'format-cpp', 'format-js', done);
  });

  gulp.task('render-wrapper', () => {
    var configuration = configurator.configure(...getConfigurators());
    var model = configurator.createModel(configuration);
    render(model, 'jswrapper');
    render(model, 'js');
    render(model, 'spec');
  });

  gulp.task('format-cpp', function (done) {
    var sources = glob.sync(`${settings.paths.src}/**/*.*`);
    var headers = glob.sync(`${settings.paths.inc}/**/*.*`);
    var files = headers.concat(sources).join(' ');
    run(`clang-format -style="{BasedOnStyle: Google, IndentWidth: 4, ColumnLimit: 110}" -i ${files}`).exec(done);
  });

  gulp.task('format-js', function () {
    return gulp.src([
      `${settings.paths.build}/spec/**/*.js`, 
      //`!${settings.paths.build}/node_modules/**/*.js`
    ]).pipe(filelog())
      .pipe(beautify({ indent_size: 2, jslint_happy: true,  }))
      .pipe(gulp.dest(settings.paths.build + '/spec'));
  });

  gulp.task('copy-headers', function () {
    return gulp.src([
      'src/**/inc/**/*.h', 'src/**/src/**/*.cc'
    ])
      .pipe(rename((pth) => {
        var parts = pth.dirname.split('/');
        pth.dirname = [parts[1], parts[0]].concat(parts.slice(2)).join('/');
      }))
      .pipe(gulp.dest(settings.paths.build ));
  });

  gulp.task('clean-wrapper', function (done) {
    return gulp.src(
      [settings.paths.inc, settings.paths.src, 
      settings.paths.build + '/spec/*', 
      '!' + settings.paths.build + '/spec/lib'], { read: false }
    ).pipe(clean({ force: true }, done));
  });
};
