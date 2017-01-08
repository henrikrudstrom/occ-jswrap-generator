const camelCase = require('camel-case');

module.exports = function (mod) {
  mod.name = 'TestModule';
  mod.wrapClass('gp_Pnt', 'Pnt', (cls) => {
    cls.wrapMethod('*', camelCase)
      .wrapProperty('X', 'SetX', 'x')
      .wrapProperty('Y', 'SetY', 'y')
      .wrapProperty('Z', 'SetZ', 'z')
      .exclude('coord')
      .exclude('Xyz')
      .exclude('changeCoord')
      .wrapConstructor('*');
  });
  mod.wrapClass('gp_Dir', 'Dir', (cls) => {
    cls.wrapConstructor('*')
      .wrapProperty('X', 'SetX', 'x')
      .wrapProperty('Y', 'SetY', 'y')
      .wrapProperty('Z', 'SetZ', 'z');
  });
  mod.wrapClass('gp_Vec', 'Vec', (cls) => {
    cls.wrapConstructor('*')
      .wrapProperty('X', 'SetX', 'x')
      .wrapProperty('Y', 'SetY', 'y')
      .wrapProperty('Z', 'SetZ', 'z');
  });

  mod.wrapClass('gp_Ax1', 'Ax1', (cls) => {
    cls.wrapConstructor('*')
      .wrapProperty('Direction', 'SetDirection', 'direction')
      .wrapProperty('Location', 'SetLocation', 'location');
  });
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
  mod.wrapClass('Geom_Curve', 'Curve', (cls) => {
    cls.wrapMethod('D0', 'd0', method => method.setOutArgs());
    cls.wrapMethod('D1', 'd1', method => method.setOutArgs());
    console.log(cls);
  });
  mod.wrapClass('Geom_Line', 'Line', (cls) => {
    cls.wrapProperty('Position', 'SetPosition', 'position');
    cls.wrapConstructor('*');
  });
};
