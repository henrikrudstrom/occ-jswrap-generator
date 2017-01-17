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
      .exclude('*Coord')
      .wrapConstructor('*');
  });
  mod.wrapClass('gp_Dir', 'Dir', (cls) => {
    cls
      .wrapMethod('*', camelCase)
      .wrapConstructor('*')
      .exclude('coord')
      .exclude('Xyz')
      .exclude('*Coord')
      .wrapProperty('X', 'SetX', 'x')
      .wrapProperty('Y', 'SetY', 'y')
      .wrapProperty('Z', 'SetZ', 'z');
  });
  mod.wrapClass('gp_Vec', 'Vec', (cls) => {
    cls
      .wrapConstructor('*')
      .wrapMethod('*', camelCase)
      .exclude('coord')
      .exclude('Xyz')
      .exclude('*Coord')
      .wrapProperty('X', 'SetX', 'x')
      .wrapProperty('Y', 'SetY', 'y')
      .wrapProperty('Z', 'SetZ', 'z');
  });

  mod.wrapClass('gp_Ax1', 'Ax1', (cls) => {
    cls
      .wrapMethod('*', camelCase)
      .wrapConstructor('*')
      .wrapProperty('Direction', 'SetDirection', 'direction')
      .wrapProperty('Location', 'SetLocation', 'location');
  });
  mod.wrapClass('gp_Ax2', 'Ax2', (cls) => {
    cls
      .wrapMethod('*', camelCase)
      .wrapConstructor('*')
      .wrapProperty('Direction', 'SetDirection', 'direction')
      .wrapProperty('Location', 'SetLocation', 'location');
  });


  mod.wrapClass('Geom_Geometry', 'Geometry', (cls) => {
    cls.wrapMethod('Mirrored', 'mirrored', (method) => method.downcast('this'));
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
  });
  mod.wrapClass('Geom_Line', 'Line', (cls) => {
    cls.wrapProperty('Position', 'SetPosition', 'position');
    cls.wrapConstructor('*');
    cls.wrapBuilder('GC_MakeLine', 'makeLine', { name: 'value', method: 'Value' });
  });

  // mod.wrapClass('Geom_BezierCurve', 'BezierCurve', (cls) => {
  //   cls.customBuilder = true;
  //   cls.wrapMethod('Poles', 'poles');
  //   cls.wrapMethod('Weights', 'weights');
  // });

  mod.wrapCollection('TColgp_Array1OfPnt', 'Array1OfPnt', 'Array1', 'gp_Pnt');
  mod.wrapCollection('TColStd_Array1OfReal', 'Array1OfReal', 'Array1', 'Standard_Real');

  mod.wrapEnum('TopAbs_Orientation', 'Orientation');

  mod.wrapClass('TopoDS_Shape', 'Shape', (cls) => {
    cls.wrapMethod('Orientation', 'orientation');
    cls.wrapConstructor('*');
  });
};
