/**
 * @description Utility class for handling fund account strings and parts
 */
class FundAccountUtils {

  constructor(){
    this.fundAccountParts = null;
    this.fundType = null;
  }

  get registry() {
    return [
      {
        value: 'gl',
        label: 'GL String',
        explode: (...args) => this._explodeGlString(...args),
        implode: (...args) => this._implodeGlString(...args),
        test: (...args) => this._isGlType(...args),
        constants: ['13U00', '775B15', '80'],
        validations: [
          {part: 'entity', required: true, length: 4},
          {part: 'department', required: true, length: 7},
          {part: 'program', length: 3},
          {part: 'project', length: 10},
          {part: 'activity', length: 6}
        ]
      },
      {
        value: 'poet',
        label: 'POET String',
        explode: (...args) => this._explodePoetString(...args),
        implode: (...args) => this._implodePoetString(...args),
        test: (...args) => this._isPoetType(...args),
        constants: ['775B15'],
        validations: [
          {part: 'project', length: 10},
          {part: 'organization', required: true, length: 7},
          {part: 'task', required: true, length: 6}
        ]
      }
    ];
  }

  /**
   * @description Parse a fund account string or parts and store internally
   * @param {String|Object} fundAccountStringOrParts
   * @param {String} fundType - The type of fund account (gl, poet, etc). If not provided, will attempt to detect.
   */
  parse(fundAccountStringOrParts, fundType) {
    if ( !fundType ) {
      fundType = this.detectType(fundAccountStringOrParts);
    }
    if ( !this.registry.find(item => item.value === fundType) ) {
      throw new Error(`Unknown fund account type: ${fundType}`);
    }

    if ( typeof fundAccountStringOrParts === 'string' ) {
      this.fundAccountParts = this.explode(fundAccountStringOrParts, fundType);
    } else if ( typeof fundAccountStringOrParts === 'object' ) {
      this.fundAccountParts = fundAccountStringOrParts;
    } else {
      throw new Error(`Invalid fund account input: ${fundAccountStringOrParts}`);
    }
    this.fundType = fundType;
  }

  validate(fundAccountStringOrParts, fundType) {
    if ( !fundAccountStringOrParts ){
      if ( this.fundAccountParts ) {
        fundAccountStringOrParts = this.fundAccountParts;
        fundType = this.fundType;

      } else {
        throw new Error('No fund account string or parts provided to validate');
      }
    }

    if ( !fundType ) {
      fundType = this.detectType(fundAccountStringOrParts);
    }
    const registryItem = this.registry.find(item => item.value === fundType);
    if ( !registryItem ) throw new Error(`Unknown fund account type: ${fundType}`);

    let parts = fundAccountStringOrParts;
    if ( typeof fundAccountStringOrParts === 'string' ) {
      parts = this.explode(fundAccountStringOrParts, fundType);
    }
    const errors = [];
    for ( const part of registryItem.validations ) {
      const error = {};
      if ( part.required && !parts[part.part] ) {
        error.missingError = true;
      }
      if ( part.length && parts[part.part] && parts[part.part].length !== part.length ) {
        error.lengthError = true;
      }
      if ( Object.keys(error).length ) {
        errors.push({ ...part, ...error });
      }
    }
    return { valid: errors.length === 0, errors };
  }

  /**
   * @description Explode a fund account string into its parts
   * @param {String|null} fundAccountString - The fund account string to explode. If null, will use previously parsed string by class instance.
   * @param {String} fundType - The type of fund account (gl, poet, etc).
   * @returns {Object} The exploded parts
   */
  explode(fundAccountString, fundType){

    // if no string provided, return previously parsed parts
    if ( !fundAccountString ){
      if ( this.fundAccountParts ){
        return this.fundAccountParts;
      }
      throw new Error('No fund account string provided to explode');
    }

    const registryItem = this.registry.find(item => item.value === fundType);
    if ( !registryItem ) throw new Error(`Unknown fund account type: ${fundType}`);
    return registryItem.explode(fundAccountString, registryItem);
  }

  /**
   * @description Implode a fund account parts object into a string
   * @param {Object} fundAccountParts - The fund account parts to implode. If null, will use previously parsed parts by class instance.
   * @param {String} fundType - The type of fund account (gl, poet, etc)
   * @returns {String} The imploded fund account string
   */
  implode(fundAccountParts, fundType){

    // if no parts provided, return previously parsed parts
    if ( !fundAccountParts ){
      if ( this.fundAccountParts ){
        fundAccountParts = this.fundAccountParts;
        fundType = this.fundType;
      } else {
        throw new Error('No fund account parts provided to implode');
      }
    }

    const registryItem = this.registry.find(item => item.value === fundType);
    if ( !registryItem ) throw new Error(`Unknown fund account type: ${fundType}`);
    return registryItem.implode(fundAccountParts, registryItem);
  }

  /**
   * @description Detect the type of fund account string or parts
   * @param {String|Object} fundAccountStringOrParts - The fund account string or parts to analyze
   * @returns {String|null} The detected fund account type or null if not found
   */
  detectType(fundAccountStringOrParts){
    const registryItem = this.registry.find(item => item.test(fundAccountStringOrParts, item));
    if ( !registryItem ) return null;
    return registryItem.value;
  }

  _isGlType(fundAccountStringOrParts, registryItem){
    if ( typeof fundAccountStringOrParts === 'string' ){
      return registryItem.constants.every(constant => fundAccountStringOrParts.includes(`-${constant}-`));
    }
    if ( typeof fundAccountStringOrParts === 'object' ){
      return Object.keys(fundAccountStringOrParts).includes('entity')
    }
    return false;
  }

  _isPoetType(fundAccountStringOrParts, registryItem){
    if ( typeof fundAccountStringOrParts === 'string' ){
      return fundAccountStringOrParts.split('-').length < 5;
    }
    if ( typeof fundAccountStringOrParts === 'object' ){
      return Object.keys(fundAccountStringOrParts).includes('organization')
    }

    return false;
  }

  _explodeGlString(glString, registryItem) {
    const parts = glString.split('-');
    return {
      entity: parts[0] || '',
      department: parts[2] || '',
      program: parts[5] || '',
      project: parts[6] || '',
      activity: parts[7] || ''
    };
  }

  _implodeGlString(glParts, registryItem) {
    const entity = glParts.entity || '';
    const department = glParts.department || '';
    const program = glParts.program || '';
    const project = glParts.project || '';
    const activity = glParts.activity || '';

    return `${entity}-${registryItem.constants[0]}-${department}-${registryItem.constants[1]}-${registryItem.constants[2]}-${program}-${project}-${activity}`;
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

}

export default new FundAccountUtils();
