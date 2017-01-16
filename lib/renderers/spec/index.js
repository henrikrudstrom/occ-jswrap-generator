const base = require('../base.js');
const Factory = require('../../factory.js');
const typemap = require('../../typemap.js');
const cls = require('./class.js');
const Callable = require('./callable.js');
const overload = require('./overload.js');
const Collection = require('./collection.js');


class WrapperRenderer extends base.ContainerRenderer {
  constructor(def, factory) {
    super(def, factory);
    this.renderers = def.members
      //.filter(mod => mod.name !== 'builtins')
      .map(mod => factory.create(mod));
  }

  renderMain(content) {
    if (!content) content = {};
    return super.renderMain(content);
  }
}
WrapperRenderer.prototype.declType = 'wrapper';

class ModuleRenderer extends base.ContainerRenderer {
  constructor(def, factory) {
    super(def, factory);
    this.renderers = def.members.map(mod => factory.create(mod));
  }
}
ModuleRenderer.prototype.declType = 'module';

class EnumRenderer extends base.Renderer {
  constructor(def, factory) {
    super(def, factory);

    var nextInt = 0;
    this.nextInt = () => {
      var val = nextInt;
      nextInt = (nextInt + 1) % this.def.values.length;
      return val;
    };
  }

  renderNewValue() {
    var val = this.def.values[this.nextInt()].name;
    return `${this.def.parent.name}.${this.def.name}.${val}`;
  }
}
EnumRenderer.prototype.declType = 'enum';

module.exports = {
  WrapperRenderer,
  ModuleRenderer,
  EnumRenderer,
  ClassRenderer: cls.ClassRenderer,
  BuiltinRenderer: cls.BuiltinRenderer,
  Callable,
  Collection,
  OverloadMethod: overload.MethodRenderer,
  OverloadGetter: overload.GetterRenderer,
  OverloadSetter: overload.SetterRenderer,
  OverloadConstructor: overload.ConstructorRenderer,
  OverloadBuilder: overload.BuilderRenderer
};

module.exports.all = Object.keys(module.exports).map(key => module.exports[key]);

module.exports.create = function create(model) {
  return new Factory(module.exports.all, new typemap.Renderer()).create(model);
};
