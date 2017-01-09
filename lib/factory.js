class Factory {
  constructor(constructors, typemap) {
    this.constructors = {};
    this.typemap = typemap;
    console.log(constructors, constructors.map(ctor => ctor.declType))
    constructors
      .forEach((ctor) => { 
        var declType = ctor.prototype.declType;
        var declTypes = Array.isArray(declType) ? declType : [declType];
        console.log(declTypes, ctor.declType)
        declTypes.forEach(dtype => {
          this.constructors[dtype] = ctor;   
        });
      });
      
    console.log(this.constructors)
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
