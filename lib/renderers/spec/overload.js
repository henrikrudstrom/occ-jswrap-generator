const base = require('../base.js');

class MethodOverloadRenderer extends base.Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
  }
  renderSpec() {

    var argWrappers = this.def.arguments.map(arg => this.typemap.getWrappedType(arg.type));
    var args = argWrappers.map(arg => arg.def.name).join(', ');
    return `\
      it('${this.def.name}(${args})', () => {
         // test 
      });
    `
  }
}
MethodOverloadRenderer.prototype.declType = 'methodOverload';

class ConstructorOverloadRenderer extends MethodOverloadRenderer {

}
ConstructorOverloadRenderer.prototype.declType = 'constructorOverload';

class GetterOverloadRenderer extends MethodOverloadRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
  }
}
GetterOverloadRenderer.prototype.declType = 'getterOverload';

class SetterOverloadRenderer extends MethodOverloadRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
  }
}
SetterOverloadRenderer.prototype.declType = 'setterOverload';

module.exports = {
  ConstructorRenderer: ConstructorOverloadRenderer,
  MethodRenderer: MethodOverloadRenderer,
  GetterRenderer: GetterOverloadRenderer,
  SetterRenderer: SetterOverloadRenderer
};
