class ConfigurationBase {
  constructor(name) {
    if (name === undefined) throw new Error('Declaration name cannot be undefined');
    this.name = name;
  }
}

module.exports = ConfigurationBase;
