const ClassDefinition = require('./class.js');

class CollectionDefinition extends ClassDefinition {
}
CollectionDefinition.prototype.declType = 'collection';

module.exports = CollectionDefinition;
