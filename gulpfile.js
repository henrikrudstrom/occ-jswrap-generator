const gulp = require('gulp');

const settings = require('./lib/settings.js');
settings.initialize();

require('./tasks/main.js')(gulp);
