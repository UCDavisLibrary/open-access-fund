import { LitElement } from 'lit';
import {render, styles} from "./oaf-submission-query.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import AppComponentController from '../../controllers/AppComponentController.js';
import QueryStringController from '../../controllers/QueryStringController.js';

export default class OafSubmissionQuery extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      results: {state: true},
      page: {state: true},
      totalPages: {state: true}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.appComponentController = new AppComponentController(this);
    this.qsCtl = new QueryStringController(this, {types: {status: 'array'}});
    this.results = [];
    this.page = 1;
    this.totalPages = 1;

    this._injectModel('AppStateModel', 'SubmissionModel');
  }

  /**
   * Handle application state updates
   * @returns
   */
  _onAppStateUpdate() {
    if ( !this.appComponentController.isOnActivePage ) return;
    this.query();
  }

  /**
   * @description Query submissions based on current query string parameters
   */
  async query(){
    const r = await this.SubmissionModel.query(this.AppStateModel.store.data.location.query);
    if ( r.state !== 'loaded' ) return;
    this.results = r.payload.results;
    this.page = r.payload.page;
    this.totalPages = r.payload.totalPages;
  }

  /**
   * @description Handle page change event from pagination element
   * @param {CustomEvent} e - event details contain new page number
   */
  _onPageChange(e) {
    if ( e.detail.page == 1 ) {
      this.qsCtl.deleteParam('page');
    } else {
      this.qsCtl.setParam('page', e.detail.page);
    }
    this.qsCtl.setLocation();
  }

}

customElements.define('oaf-submission-query', OafSubmissionQuery);
