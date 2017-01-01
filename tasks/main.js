module.exports = function(gulp) {
  require('../src/parse/parse.js')(gulp);
  require('./generator-tests.js');
};
