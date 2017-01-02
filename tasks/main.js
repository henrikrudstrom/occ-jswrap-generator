const render = require('../src/render.js');
const configure = require('../src/configure.js');
const settings = require('../src/settings.js');
const clean = require('gulp-clean');

module.exports = function(gulp) {
  require('../src/parse/parse.js')(gulp);
  require('./generator-tests.js');

  gulp.task('configure', () => {

  });

  gulp.task('render-wrapper', ['copy-headers'], () => {
    var definition = configure();
    render.wrapper(definition);
  });

  gulp.task('copy-headers', ['clean-wrapper'], function() {
    return gulp.src([
      'src/cpp/inc/**/*.h', 'src/cpp/src/**/*.cc'
    ], { base: 'src/cpp' })
    .pipe(gulp.dest('build'));
  });

  gulp.task('clean-wrapper', function (done) {
    return gulp.src(
      [settings.paths.inc, settings.paths.src],
      { read: false }
    ).pipe(clean(done));
  });
};
