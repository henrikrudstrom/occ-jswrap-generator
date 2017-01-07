const camelCase = require('camel-case');

module.exports = function (mod) {
  mod.name = 'TestModule';
  mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
    cls.wrapMethod('*', camelCase)
      .wrapProperty('X', 'SetX', 'x')
      .wrapProperty('Y', 'SetY', 'y')
      .wrapProperty('Z', 'SetZ', 'z')
      .excludeByName('coord')
      .excludeByName('Xyz')
      .excludeByName('changeCoord')
      .wrapConstructor('*');
  })
  mod.wrapClass('Geom_Geometry', 'Geometry', (cls) => {
    cls.wrapMethod('Mirrored', 'mirrored');
  });
  mod.wrapClass('Geom_Point', 'Point', (cls) => {
    cls.wrapMethod('Distance', 'distance');
  });
  mod.wrapClass('Geom_CartesianPoint', 'CartesianPoint', (cls) => {
    cls.wrapProperty('X', 'SetX', 'x')
      .wrapProperty('Y', 'SetY', 'y')
      .wrapProperty('Z', 'SetZ', 'z')
      .wrapConstructor('*');
  });
};
