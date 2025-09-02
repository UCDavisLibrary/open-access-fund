import Payload from "./payload.js";
import { DataDefinitions } from "../../../lib/utils/DataDefinitions.js";

export default class SubmissionPayload extends Payload {

  constructor(data, opts={}) {
    super(data, opts);


  }

  static get properties() {
    return {
      authorLastName:  { required: true, maxLength: 250 },
      authorFirstName: { required: true, maxLength: 250 },
      authorMiddleInitial: { required: false, maxLength: 10 },
      otherAuthors: { required: false, maxLength: 2000 },
      authorAffiliation: { customValidator: function (v) { return this._validateAuthorAffiliation(v); } },
      authorAffiliationOther: { required: false, maxLength: 250 },
    }
  }

  get data(){
    const d = { ...super.data };
    if ( d.authorAffiliationOther && d.authorAffiliation !== 'other' ) {
      delete d.authorAffiliationOther;
    }
    return d;
  }

  set data(data){
    super.data = data;
  }

  _validateAuthorAffiliation(value){
    if ( !this.validateRequired('authorAffiliation', value) ) return;

    if ( !DataDefinitions.AFFILIATIONS.map(a => a.value).includes(value) ) {
      this.addValidationError('authorAffiliation', { notValidOption: true });
      return;
    }

    if ( value === 'other' ) {
      if ( !this.validateRequired('authorAffiliationOther', this.data.authorAffiliationOther) ) return;
    }
  }

}
