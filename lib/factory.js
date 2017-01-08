class Factory {
  constructor(constructors, typemap) {
    this.constructors = {};
    this.typemap = typemap;
    constructors.forEach((ctor) => {
      this.constructors[ctor.prototype.declType] = ctor;
    });
  }

  create(def, ...rest) {
    if (this.typemap) {
      rest = [this.typemap].concat(rest);
    }
    var ctor = this.constructors[def.declType];
    if (!ctor) throw new Error('Cannot find constructor for ' + def.declType);
    var renderer = new this.constructors[def.declType](def, this, ...rest);
    if (this.typemap)
      this.typemap.populate(renderer);
    return renderer;
  }
}

module.exports = Factory;
