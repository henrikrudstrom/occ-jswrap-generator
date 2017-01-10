const base = require('../base.js');

class MethodOverloadRenderer extends base.Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
  }

  renderTypeExpectation() {
    if (this.def.returnType !== 'void'){
      var type = this.typemap.getWrappedType(this.def.returnType).def.qualifiedName;
      return `expect(result).to.be.typeOrConstructorOf('${type}');`
    }
    return '';
  }

  renderSpec() {
    var argRenderers = this.def.arguments.map(arg => this.typemap.getWrappedType(arg.type));
    var argsNames = argRenderers.map(arg => arg.def.name).join(', ');


    return `\
      it('${this.def.name}(${argsNames}', () => {
         var result = ${this.renderCall('subject')};
         ${this.renderTypeExpectation()}
      });`
  }

  renderArguments() {
    var argRenderers = this.def.arguments.map(arg => this.typemap.getWrappedType(arg.type));
    return argRenderers.map(arg => arg.renderNewValue());
  }

  renderCall(objVar) {
    return `${objVar}.${this.def.name}(${this.renderArguments()})`;
  }



}
MethodOverloadRenderer.prototype.declType = 'methodOverload';

class ConstructorOverloadRenderer extends MethodOverloadRenderer {
  renderCall() {
    return `new ${this.def.parent.parent.qualifiedName.replace('::', '.')}(${this.renderArguments()})`;
  }
}
ConstructorOverloadRenderer.prototype.declType = 'constructorOverload';

class GetterOverloadRenderer extends MethodOverloadRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
  }
  renderSpec() {
    var argRenderers = this.def.arguments.map(arg => this.typemap.getWrappedType(arg.type));
    var argsNames = argRenderers.map(arg => arg.def.name).join(', ');
    var type = this.typemap.getWrappedType(this.def.returnType).def.name;
    return `\
      it('${this.def.name}', () => {
         var result = subject.${this.def.name};
         ${this.renderTypeExpectation()}
      });`
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
