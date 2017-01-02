const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const run = require('gulp-run');
const gutil = require('gulp-util');
const settings = require('../settings.js');

module.exports = function(gulp) {
  const runSequence = require('run-sequence').use(gulp);

  const parseScript = path.join(__dirname, 'parse_headers.py');

  function cacheFile(moduleName) {
    return `${settings.paths.headerCache}/${moduleName}.json`;
  }

  function parseHeaders(moduleName, done) {
    mkdirp.sync(settings.paths.headerCache);
    var args = [
      moduleName,
      settings.oce.include,
      settings.paths.data,
      cacheFile(moduleName)
    ].join(' ');

    var cmd = `python ${parseScript} ${args}`;
    return run(cmd).exec(done);
  }

  function groupBy(arr, fn) {
    var grouped = [];
    function add(value, group) {
      if (grouped[group] === undefined)
        grouped[group] = [];
      grouped[group].push(value);
    }
    arr.forEach((value, index) => add(value, fn(value, index)));
    return grouped;
  }

  // create gulp task for each module
  settings.oce.modules.forEach(function(moduleName) {
    gulp.task('parse-headers:' + moduleName, function(done) {
      parseHeaders(moduleName, done);
    });
  });

  // Parse all headers
  gulp.task('parse-headers', (done) => {
    // only parse missing modules, or if forced.
    var parseModules = settings.oce.modules.filter(
      mod => !fs.existsSync(cacheFile(mod))
    );
    if (parseModules.length < 1) {
      gutil.log('Header cache up to date');
      return done();
    }
    var groups = groupBy(parseModules.map(mod => 'parse-headers:' + mod), (name, index) => Math.round(index / 8));
    return runSequence.apply(this, groups.concat([done]));
  });
};
