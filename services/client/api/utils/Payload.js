import logger from '../../../lib/utils/logger.js';
export default class Payload {

  constructor(data, opts={}){
    this.data = data;
    this.opts = opts;

    this.validations = {};
  }

  set data(data={}){
    const d = {};
    for ( let k of Object.keys(this.properties) ){
      if ( data[k] !== undefined ) d[k] = data[k];
    }
    this._data = d;
  }

  get data(){
    return this._data || {};
  }

  static get properties() {
    return {};
  }

  get properties(){
    return this.constructor.properties;
  }

  get isInvalid(){
    return Object.keys(this.validations).length > 0;
  }

  async validate(opts={}) {
    this.validations = {};
    for ( let [field, fieldOpts] of Object.entries(this.properties) ){
      const value = this.data[field];

      // Check required
      if ( fieldOpts.required ) {
        if ( !this.validateRequired(field, value) ) {
          continue;
        }
      }

      // check max length
      if ( fieldOpts.maxLength && value && value.length > fieldOpts.maxLength ) {
        this.addValidationError(field, { maxLength: fieldOpts.maxLength });
        continue;
      }

      // custom validator
      if (fieldOpts.customValidator && typeof fieldOpts.customValidator === 'function') {
        const result = fieldOpts.customValidator.call(this, value);
        if (result instanceof Promise) {
          await result;
        }
      }
    }
  }

  invalidResponse(res, req){
    logger.info('Validation failed', {validations: this.validations}, req.corkTraceId);
    return res.status(400).json({
      message: 'Validation failed',
      validations: this.validations
    });
  }

  addValidationError(field, error){
    if (!this.validations[field]) {
      this.validations[field] = [];
    }
    this.validations[field].push(error);
  }

  validateRequired(field, value){
    if ( value === undefined || value === null || (typeof value === 'string' && value.trim() === ''))  {
      this.addValidationError(field, { required: true });
      return false;
    }
    return true;
  }

}
