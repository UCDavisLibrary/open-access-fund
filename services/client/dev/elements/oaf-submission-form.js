import { LitElement } from 'lit';
import {render, styles} from "./oaf-submission-form.tpl.js";

export default class OafSubmissionForm extends LitElement {

  static get properties() {
    return {
      payload: {type: Object},
      selectedFundType: { type: Object }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.payload = {};
    this.selectedFundType = null;
  }

  _onSubmit(e){
    e.preventDefault();
    console.log('submit', this.payload);
  }

  _onFundPartInput(prop, value){
    this.payload.fundAccount.parts[prop] = value;
    this.requestUpdate();
  }

  _onInput(prop, value){
    if ( prop === 'fundAccount' ){
      if ( !value ){
        this.payload[prop] = null;
        this.selectedFundType = null;
      } else {
        this.payload[prop] = {
          fundType: value.value,
          parts: {}
        }
        this.selectedFundType = value;
      }
    } else {
      this.payload[prop] = value;
    }

    this.requestUpdate();
  }

}

customElements.define('oaf-submission-form', OafSubmissionForm);
