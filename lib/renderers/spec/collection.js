const base = require('../base.js');

class CollectionRenderer extends base.ContainerRenderer {
  constructor(def, factory, typemap) {
    super(def, factory, typemap);
  }

  renderConstructorArgs() {
    const containedType = this.typemap.getWrappedType(this.def.containedType);
    return [1, 2].map(() => containedType.renderNewValue()).join(', ');
  }

  renderDefaultConstructor() {
    var args = this.renderConstructorArgs();
    return `new ${this.def.parent.name}.${this.def.name}(${args});`;
  }

  renderMain(content) {
    content[`[spec]/${this.def.relativePath}.js`] = this.renderSuite();
    return super.renderMain(content);
  }
  
  renderNewValue(){
    const containedType = this.typemap.getWrappedType(this.def.containedType);
    const args = [1,2,3].map(() => containedType.renderNewValue());
    return `new ${this.parentName}.${this.name}(${args});`;
  }

  renderSuite() {
    var imports = this.def.parent.getDependencies()
       .concat([this.def.parent])
       .map(dep => `const ${dep.name} = require('../../lib/${dep.name}.js');`);

    return `\n
const chai = require('chai');
const expect = chai.expect;

var lib = require('../lib');
${imports.join('\n')}

describe('${this.def.name}', () => {
  it('works', () => {
    let items = [${this.renderConstructorArgs()}];
    let coll = new ${this.def.parent.name}.${this.def.name}(items);
    expect(coll).to.be.typeOrConstructorOf('${this.def.name}');
    expect(coll.__cptr__()).to.be.above(0);
    expect(coll.length).to.equal(2);
    expect(coll[0]).to.eql(items[0]);
    expect(coll[1]).to.eql(items[1]);
  })
});`;
  }
}

CollectionRenderer.prototype.declType = 'collection';

module.exports = CollectionRenderer;
