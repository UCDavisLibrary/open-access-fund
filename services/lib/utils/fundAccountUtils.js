class FundAccountUtils {

  get registry() {
    return [
      {
        value: 'gl',
        label: 'GL String',
        explode: (...args) => this._explodeGlString(...args),
        implode: (...args) => this._implodeGlString(...args),
        constants: ['13U00', '775B15-80']
      },
      {
        value: 'poet',
        label: 'POET String',
        explode: (...args) => this._explodePoetString(...args),
        implode: (...args) => this._implodePoetString(...args),
        constants: ['775B15']
      }
    ];
  }

  _explodeGlString(glString, registryItem) {
    const parts = glString.split('-');
    return {
      entity: parts[0] || '',
      department: parts[2] || '',
      program: parts[5] || '',
      project1: parts[6] || '',
      activity: parts[7] || ''
    };
  }

  _implodeGlString(glParts, registryItem) {
    const entity = glParts.entity || '';
    const department = glParts.department || '';
    const program = glParts.program || '';
    const project1 = glParts.project1 || '';
    const activity = glParts.activity || '';

    return `${entity}-${registryItem.constants[0]}-${department}-${registryItem.constants[1]}-${program}-${project1}-${activity}`;
  }

  _explodePoetString(poetString, registryItem) {
    const parts = poetString.split('-');
    let project = '';
    if ( parts.length === 4) {
      project = parts.shift();
    }
    let organization = parts.shift() || '';
    let task = parts.pop() || '';
    return {
      project,
      organization,
      task
    };
  }

  _implodePoetString(poetParts, registryItem) {
    const project = poetParts.project || '';
    const organization = poetParts.organization || '';
    const task = poetParts.task || '';

    const base = `${organization}-${registryItem.constants[0]}-${task}`;

    if ( project ){
      return `${project}-${base}`;
    } else {
      return base;
    }
  }


  explode(fundAccountString, fundType){
    const registryItem = this.registry.find(item => item.value === fundType);
    if ( !registryItem ) throw new Error(`Unknown fund account type: ${fundType}`);
    return registryItem.explode(fundAccountString, registryItem);
  }

  implode(fundAccountParts, fundType){
    const registryItem = this.registry.find(item => item.value === fundType);
    if ( !registryItem ) throw new Error(`Unknown fund account type: ${fundType}`);
    return registryItem.implode(fundAccountParts, registryItem);
  }

}

export default new FundAccountUtils();
