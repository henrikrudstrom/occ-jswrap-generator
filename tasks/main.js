const clean = require('gulp-clean');
const glob = require('glob');
const run = require('gulp-run');
const runSequence = require('run-sequence');
const path = require('path');
const rename = require('gulp-rename');

const render = require('../lib/render.js');
const configure = require('../lib/configure.js');
const settings = require('../lib/settings.js');

function loadConfig(file) {
  file = path.relative(__dirname, file);
  return require(file); // eslint-disable-line global-require
}

function getConfigurators() {
  return glob.sync(`${settings.paths.definition}/**/configure.js`).map(loadConfig);
}

const jsWrapperRenderers = require('../lib/renderers/jswrapper');

module.exports = function (gulp) {
  require('../lib/parse/parse.js')(gulp);
  require('./generator-tests.js');

  gulp.task('configure', () => {

  });

  gulp.task('render', (done) => {
    runSequence('clean-wrapper', 'copy-headers', 'render-wrapper', 'format-cpp', done);
  });

  gulp.task('render-wrapper', () => {
    var configuration = configure(...getConfigurators());
    var content = render(configuration, jsWrapperRenderers.all);
    render.write(content, settings);
  });

  gulp.task('format-cpp', function (done) {
    var sources = glob.sync(`${settings.paths.src}/**/*.*`);
    var headers = glob.sync(`${settings.paths.inc}/**/*.*`);
    var files = headers.concat(sources).join(' ');
    run(`clang-format -style="{BasedOnStyle: Google, IndentWidth: 4, ColumnLimit: 110}" -i ${files}`).exec(done);
  });

  gulp.task('copy-headers', function () {
    return gulp.src([
      'src/**/inc/**/*.h', 'src/**/src/**/*.cc'
    ])
      .pipe(rename((pth) => {
        var parts = pth.dirname.split('/');
        pth.dirname = [parts[1], parts[0]].concat(parts.slice(2)).join('/');
      }))
      .pipe(gulp.dest(settings.paths.build));
  });

  gulp.task('clean-wrapper', function (done) {
    return gulp.src(
      [settings.paths.inc, settings.paths.src], { read: false }
    ).pipe(clean({ force: true }, done));
  });
};
