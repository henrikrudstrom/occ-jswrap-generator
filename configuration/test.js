const camelCase = require('camel-case');

module.exports = function(mod) {
  mod.name = 'TestModule';
  mod.wrapClass('gp_Pnt', 'Pnt')
    .wrapMethod('*', camelCase)
    .wrapProperty('X', 'SetX', 'x')
    .wrapProperty('Y', 'SetY', 'y')
    .wrapProperty('Z', 'SetZ', 'z');
  mod.wrapClass('Geom_Geometry', 'Geometry');
  mod.wrapClass('Geom_Point', 'Point');
  mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint')
    .wrapProperty('X', 'SetX', 'x')
    .wrapProperty('Y', 'SetY', 'y')
    .wrapProperty('Z', 'SetZ', 'z');
};
