const TestModule = require('../../lib/TestModule.js');

module.exports = {
  BezierCurve: () => new TestModule.BezierCurve(new TestModule.Array1OfPnt([
    new TestModule.Pnt(1, 2, 3), new TestModule.Pnt(1, 4, 5), new TestModule.Pnt(4, 2, 1)
  ]))
}
