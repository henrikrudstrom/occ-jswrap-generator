var testmod = require('bindings')('TestModule.node');
var pp = new testmod.Pnt(1.0,2.0,3.0);
console.log(pp);
var p1 = new testmod.CartesianPoint(pp);
console.log(p1);
var pp2 = new testmod.Pnt(3,2,1);
var p2 = new testmod.CartesianPoint(pp2);
// var dist = p1.distance(p2);
// console.log(dist);
// var gpp = new testmod.Pnt(1, 2, 3);
//
// try {
//     var dist2 = p1.distance(gpp);
// } catch (ex) {
//     console.log(ex);
// }
var p3 = p1.mirrored(pp2);
console.log(p3);
