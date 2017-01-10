const base = require('../base.js');

class MethodOverloadRenderer extends base.Renderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
  }

  renderTypeExpectation() {
    const outputArgs = this.def.getOutputArguments();
    if (this.def.returnType === 'void' && outputArgs.length === 0) {
      return '';
    }

    if (outputArgs.length < 2) {
      var nativeType = this.def.returnType;
      if (outputArgs.length === 1)
        nativeType = outputArgs[0].type;

      const type = this.typemap.getWrappedType(nativeType).def.qualifiedName;
      return `expect(result).to.be.typeOrConstructorOf('${type}');`;
    }
    return outputArgs.map((arg) => {
      const type = this.typemap.getWrappedType(arg.type).def.qualifiedName;
      return `expect(result['${arg.name}']).to.be.typeOrConstructorOf('${type}');`;
    }).join('\n');
  }

  renderSpec() {
    const argRenderers = this.def.getInputArguments()
      .map(arg => this.typemap.getWrappedType(arg.type));
    const argsNames = argRenderers.map(arg => arg.def.name).join(', ');

    return `\
      it('${this.def.name}(${argsNames}', () => {
         var result = ${this.renderCall('subject')};
         ${this.renderTypeExpectation()}
      });`;
  }

  renderArguments() {
    const argRenderers = this.def.getInputArguments()
      .map(arg => this.typemap.getWrappedType(arg.type));
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
  renderSpec() {
    return ''
  }
}
SetterOverloadRenderer.prototype.declType = 'setterOverload';

module.exports = {
  ConstructorRenderer: ConstructorOverloadRenderer,
  MethodRenderer: MethodOverloadRenderer,
  GetterRenderer: GetterOverloadRenderer,
  SetterRenderer: SetterOverloadRenderer
};
