const overload = require('./overload.js');
const callable = require('./callable.js');

class BuilderRenderer extends callable.MethodRenderer {
  renderMemberInitialization() {
    return `Nan::SetMethod(ctor, "${this.def.name}", ${this.def.name});`;
  }

  renderIncludes() {
    return [`#include <${this.def.nativeName}.hxx>`];
  }
}
BuilderRenderer.prototype.declType = 'builder';

class BuilderOverloadRenderer extends overload.MethodRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
    this.nanArgType = 'Nan::FunctionCallbackInfo<v8::Value>';
  }

  renderGetInstance() {
    return '';
  }

  getReturnValueExpressions(resVar) {
    return super.getReturnValueExpressions(resVar)
      .concat(this.def.parent.resultGetters.map(getter => ({
        name: getter.name,
        value: this.typemap.getWrappedType(getter.type).toJs(`builder.${getter.method}()`)
      })));
  }

  renderNativeCall(args) {
    var returnExprs = this.getReturnValueExpressions('res');

    return `\
        ${this.def.parent.nativeName} builder(${args});
        ${this.renderReturnValues(returnExprs)}`;
  }
}
BuilderOverloadRenderer.prototype.declType = 'builderOverload';
module.exports = {
  BuilderOverloadRenderer,
  BuilderRenderer
};
