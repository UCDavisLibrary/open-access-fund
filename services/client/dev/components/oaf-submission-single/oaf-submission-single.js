import { LitElement } from 'lit';
import {render, styles} from "./oaf-submission-single.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import AppComponentController from '../../controllers/AppComponentController.js';
import ScrollController from '../../controllers/ScrollController.js';
import fundAccountUtils from '../../../../lib/utils/fundAccountUtils.js';

export default class OafSubmissionSingle extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      submissionId: {state: true},
      submissionListUrl: {state: true},
      data: {state: true},
      displayTitle: {state: true},
      fundAccountString: {state: true},
      noScrollOnUpdate: { state: true },
      payload: { state: true }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.submissionId = null;
    this.data = null;

    this.appComponentController = new AppComponentController(this);
    this.scrollCtl = new ScrollController(this);
    this.noScrollOnUpdate = false;

    this.payload = {};

    this._injectModel('AppStateModel', 'SubmissionModel');
  }

  willUpdate(props){
    if ( props.has('data') ){

      // trim title for display
      const title = this.data?.articleTitle || this.submissionId || '';
      const maxTitleLength = 75;
      this.displayTitle = title.length > maxTitleLength ? title.slice(0,maxTitleLength) + '...' : title;

      if ( this.data?.fundAccount?.bigsysValueInvalid ){
        this.fundAccountString = this.data?.fundAccount?.bigsysValue || 'Missing or invalid fund account';
      } else {
        try {
          this.fundAccountString = fundAccountUtils.implode(this.data?.fundAccount?.parts || {}, this.data?.fundAccount?.fundType);
          const accountType = fundAccountUtils.registry.find(c => c.value === this.data?.fundAccount?.fundType);
          this.fundAccountString = `${this.fundAccountString} (${accountType?.label || ''})`;
        } catch (error) {
          this.fundAccountString = 'Error parsing fund account';
        }
      }

    }
  }

  /**
   * Handle application state updates
   * @returns
   */
  async _onAppStateUpdate(e) {
    if ( !this.appComponentController.isOnActivePage ) return;
    this.submissionId = e.location.path[1];
    this.payload = {};

    // for breadcrumb link back to submission list
    if ( e.lastPage === 'home') {
      const qs = new URLSearchParams(e.lastLocation.query);
      this.submissionListUrl = `/?${qs.toString()}`;
    } else {
      this.submissionListUrl = '/';
    }

    await this.getSubmission();

    if ( !this.noScrollOnUpdate ){
      this.scrollCtl.scrollToTop();
    }
    this.noScrollOnUpdate = false;
  }

  async getSubmission(){
    const r = await this.SubmissionModel.get(this.submissionId);
    if ( r?.state !== 'loaded' ) return;
    this.data = r.payload;
  }

  _onSubmissionCommentcreateUpdate(e){
    this.noScrollOnUpdate = true;
  }

  _onSubmissionCommentupdateUpdate(e){
    if ( e.state !== 'loaded' ) return;
    this.noScrollOnUpdate = true;
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

  async _onFormSectionToggle(e){
    for ( const field of e.detail.fieldPaths ){
      if ( !field ) continue;
      const topProp = field.split('.')[0];
      this.payload[topProp] = e.detail.showForm ? this.data[topProp] : null;
    }
    this.requestUpdate();
  }

  async _onFormSaveClick(e){
    const payload = {};
    for ( const field of e.detail.fieldPaths ){
      if ( !field ) continue;
      const topProp = field.split('.')[0];
      if ( this.payload[topProp] === undefined || this.payload[topProp] === null ) continue;
      payload[topProp] = this.payload[topProp];
    }

    const r = await this.SubmissionModel.patch(this.submissionId, payload);
    console.log(r);
  }

}

customElements.define('oaf-submission-single', OafSubmissionSingle);
