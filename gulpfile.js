const gulp = require('gulp');

const settings = require('./src/settings.js');
settings.initialize();

require('./tasks/main.js')(gulp);
