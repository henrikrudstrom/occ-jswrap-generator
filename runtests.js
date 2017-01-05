var Mocha = require('mocha'),
  fs = require('fs'),
  path = require('path');

var mocha = new Mocha({
  //ui: 'tdd'
  reporter: 'spec'
});

mocha.addFile(
  path.join(__dirname, 'spec/definitionSpec.js')
);

mocha.run(function (failures) {
  process.on('exit', function () {
    process.exit(failures);
  });
});
