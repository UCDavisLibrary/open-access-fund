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

/**
 * @description Main entrypoint for OAF submission form web component. Meant to be embedded in webpages.
 * @param {Object} payload - The submission form data
 * @param {Object} selectedFundType - The fund type selected by the user in the form along with its component parts
 * @param {String} page - The current page being displayed by the element
 * @param {Boolean} _submitting - Whether or not the form is currently being submitted
 * @param {Boolean} _validationError - Whether or not there was a validation error when submitting the form
 */
export default class OafSubmissionForm extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      payload: {type: Object},
      selectedFundType: { type: Object },
      page: { type: String },
      _submitting: { state: true },
      _validationError: { type: Boolean }
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
    this.page = 'oaf-submission-form';
    this._validationError = false;

    config.setAdminAppHostFromDocument();

    this._injectModel('SubmissionModel');
  }

  /**
   * @description Lit lifecycle method called after the element is first updated.
   */
  async firstUpdated() {
    const recaptchaInitialized = await recaptcha.init();
    if ( !recaptchaInitialized ) {
      this.page = 'recaptcha-failure';
    }

  }

  /**
   * @description Handles form submission event
   * @param {*} e - The form submission event
   * @returns
   */
  async _onSubmit(e){
    e.preventDefault();
    if ( this._submitting ) return;
    this._submitting = true;
    await this.submit();
    this._submitting = false;
  }

  /**
   * @description Submits the form payload to the API
   * @returns
   */
  async submit(){
    this._validationError = false;
    const payload = JSON.parse(JSON.stringify(this.payload));
    let recaptchaToken = null;
    if ( !recaptcha.config.disabled ) {
      recaptchaToken = await recaptcha.execute();
      if ( !recaptchaToken ) {
        this.page = 'recaptcha-failure';
        return;
      }
    }
    this.logger.info('Submitting OAF application', {payload, recaptchaToken});

    const r = await this.SubmissionModel.submit(payload, recaptchaToken);
    this.logger.info('SubmissionModel.submit response', {response: r});
    if ( r.state === 'error' ) {

      // show error on recaptcha failure
      if ( r.error?.response?.status === 401 ){
        this.page = 'recaptcha-failure';
        return;
      }

      // show error on server failure
      if ( r.error?.response?.status === 500 ){
        this.page = 'error-500';
        return;
      }

      // show validation errors
      if ( r.error?.payload?.validationError ){
        this._validationError = true;
        this.scrollToFormTop();
        return;
      }
    }

    if ( r.state === 'loaded' ) {
      this.page = 'submission-success';
    }

    return r;
  }

  /**
   * @description Scrolls the window to the top of the form
   */
  scrollToFormTop(){
    const formTop = this.renderRoot.querySelector('form[page-id="oaf-submission-form"]').offsetTop;
    window.scrollTo({ top: formTop - 20, behavior: 'smooth' });
  }

  /**
   * @description Handles input events from fund account part inputs
   * @param {*} prop - The property name
   * @param {*} value - The new value
   */
  _onFundPartInput(prop, value){
    this.payload.fundAccount.parts[prop] = value;
    this.requestUpdate();
  }

  /**
   * @description Handles input events from the form
   * @param {*} prop - The property name
   * @param {*} value - The new value
   */
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
