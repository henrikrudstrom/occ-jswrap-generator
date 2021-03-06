const base = require('../base.js');

class MethodOverloadRenderer extends base.Renderer {
  constructor(def, factory, typemap, parentDef) {
    super(def, factory, typemap);
    this.parentDef = parentDef;
  }

  getReturnValuesAndTypes() {
    const outputArgs = this.def.getOutputArguments();
    const returns = {};

    if (this.def.returnType !== 'void')
      returns.return = this.def.returnType;
    outputArgs.forEach((arg) => {
      returns[arg.name] = arg.type;
    });
    return returns;
  }

  renderTypeExpectation() {
    var returns = this.getReturnValuesAndTypes();
    var keys = Object.keys(returns);
    return keys.map((argName) => {
      const typeKey = returns[argName];
      const type = this.typemap.getWrappedType(typeKey);
      let typeName = type.def.jsname;

      if (this.def.specializedReturnType === 'this')
        typeName = this.parentDef.jsname;

      let resVar = 'result';
      if (keys.length > 1)
        resVar = `result['${argName}']`;

      let res = `expect(${resVar}).to.be.typeOrConstructorOf('${typeName}');`;
      if (type.declType !== 'builtin' && type.declType !== 'enum')
        res += `\nexpect(${resVar}.__cptr__()).to.be.above(0);`;

      return res;
    }).join('\n');
  }

  renderSpec() {
    const argRenderers = this.def.getInputArguments()
      .map(arg => this.typemap.getWrappedType(arg.type));
    const argsNames = argRenderers.map(arg => arg.def.name).join(', ');

    return `\
      it('${this.def.name}(${argsNames})', () => {
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
  constructor(def, factory, typemap, parentDef) {
    super(def, factory, typemap, parentDef);
  }

  renderSpec() {
    return `\
      it('${this.def.name}', () => {
         var result = subject.${this.def.name};
         ${this.renderTypeExpectation()}
      });`;
  }

}
GetterOverloadRenderer.prototype.declType = 'getterOverload';

class SetterOverloadRenderer extends MethodOverloadRenderer {
  renderSpec() {
    return '';
  }
}
SetterOverloadRenderer.prototype.declType = 'setterOverload';

class BuilderOverloadRenderer extends MethodOverloadRenderer {
  renderCall() {
    return `${this.def.parent.parent.qualifiedName.replace('::', '.')}.${this.def.name}(${this.renderArguments()})`;
  }

  getReturnValuesAndTypes() {
    const returns = super.getReturnValuesAndTypes();
    this.def.parent.resultGetters.forEach((getter) => {
      returns[getter.name] = getter.type;
    });
    return returns;
  }
}
BuilderOverloadRenderer.prototype.declType = 'builderOverload';


module.exports = {
  ConstructorRenderer: ConstructorOverloadRenderer,
  MethodRenderer: MethodOverloadRenderer,
  GetterRenderer: GetterOverloadRenderer,
  SetterRenderer: SetterOverloadRenderer,
  BuilderRenderer: BuilderOverloadRenderer
};
