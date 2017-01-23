function extend(src, target, factory) {
  Object.keys(target).forEach((key) => {
    const val = target[key];
    if (val === undefined || typeof (val) === 'function')
      return;
    src[key] = target[key];
  });
}

class DefinitionBase {
  constructor(conf, factory, typemap, parent) {
    extend(this, conf);
    this.typemap = typemap;
    this.parent = parent;
    this.jsname = this.jsname || conf.name;
  }

  canBeWrapped() {
    return true;
  }
}

module.exports = DefinitionBase;
