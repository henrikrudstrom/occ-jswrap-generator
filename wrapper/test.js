const camelCase = require('camel-case');

module.exports = function(mod) {
  mod.name = 'test-module';
  mod.wrapClass('gp_Pnt')
    .wrapMethods('*', camelCase)
    .wrapProperty('x', 'X', 'GetX')
    .wrapProperty('y', 'Y', 'GetY')
    .wrapProperty('z', 'Z', 'GetZ');
};
