const camelCase = require('camel-case');

module.exports = function(mod) {
  mod.name = 'TestModule';
  mod.wrapClass('gp_Pnt', 'Pnt')
    .wrapMethod('*', camelCase)
    .wrapProperty('X', 'SetX', 'x')
    .wrapProperty('Y', 'SetY', 'y')
    .wrapProperty('Z', 'SetZ', 'z')
    .excludeByName('coord')
    .excludeByName('Xyz')
    .excludeByName('changeCoord')
    .wrapConstructor('*');
  mod.wrapClass('Geom_Geometry', 'Geometry')
    .wrapMethod('Mirrored', 'mirrored');
  mod.wrapClass('Geom_Point', 'Point')
    .wrapMethod('Distance', 'distance');
  mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint')
    .wrapProperty('X', 'SetX', 'x')
    .wrapProperty('Y', 'SetY', 'y')
    .wrapProperty('Z', 'SetZ', 'z')
    .wrapConstructor('*');
};
