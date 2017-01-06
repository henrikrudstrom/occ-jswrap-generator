const settings = require('../src/settings.js');
settings.initialize();

const yargs = require('yargs');
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');

gulp.task('pre-test', function () {
  return gulp.src(['src/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

function getSources() {
  var arg = yargs.argv.spec || '*';
  return `spec/${arg}Spec.js`;
}

gulp.task('test', function() {
  gulp.src(getSources())
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('test-cover', ['pre-test'], function() {
  gulp.src(getSources())
    .pipe(mocha({ reporter: 'spec' }))
    .pipe(istanbul.writeReports());
    // Enforce a coverage of at least 90%
    // .pipe(istanbul.enforceThresholds());
});
