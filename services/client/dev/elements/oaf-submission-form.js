import { LitElement } from 'lit';
import {render, styles} from "./oaf-submission-form.tpl.js";

import config from '../../../lib/utils/config.js';
import recaptcha from '../utils/recaptcha.js';
import { Registry, LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

// cork models
import '../../../lib/cork/models/ConfigModel.js';
import '../../../lib/cork/models/SubmissionModel.js';
import '../../../lib/cork/models/ValidationModel.js';
Registry.ready();


export default class OafSubmissionForm extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      payload: {type: Object},
      selectedFundType: { type: Object },
      _submitting: { state: true }
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
    this._submitting = false;

    config.setAdminAppHostFromDocument();

    this._injectModel('SubmissionModel');
  }

  async firstUpdated() {
    const recaptchaInitialized = await recaptcha.init();
    if ( !recaptchaInitialized ) {
      //todo - show error
    }

  }

  async _onSubmit(e){
    e.preventDefault();
    if ( this._submitting ) return;
    this._submitting = true;
    const r = await this.submit();
    this._submitting = false;
  }

  async submit(){
    const payload = JSON.parse(JSON.stringify(this.payload));
    if ( !recaptcha.config.disabled ) {
      payload.recaptchaToken = await recaptcha.execute();
      if ( !payload.recaptchaToken ) {
        //todo - show error
        return;
      }
    }

    console.log('submit', payload);
    const r = await this.SubmissionModel.submit(payload);
    // todo - show error on recaptcha failure
    // todo - show error on non validation failure
    console.log('response', r);
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
