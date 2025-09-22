import { LitElement } from 'lit';
import {render, styles} from "./oaf-submission-query.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import AppComponentController from '../../controllers/AppComponentController.js';
import QueryStringController from '../../controllers/QueryStringController.js';
import ScrollController from '../../controllers/ScrollController.js';

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
    this.scrollCtl = new ScrollController(this);
    this.resetState();

    this._injectModel('AppStateModel', 'SubmissionModel');
  }

  resetState() {
    this.results = [];
    this.page = 1;
    this.totalPages = 1;
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
    this.resetState();
    await this.qsCtl.queryIsSet;
    const r = await this.SubmissionModel.query(this.qsCtl.getQuery(true));
    if ( r.state !== 'loaded' ) return;
    this.results = r.payload.results;
    this.page = r.payload.page;
    this.totalPages = r.payload.totalPages;
    await this.updateComplete;
    if ( this.AppStateModel.store.data.lastPage !== this.AppStateModel.store.data.page ) {
      this.scrollCtl.scrollToLastPagePosition();
    } else {
      this.scrollCtl.scrollToTopOfElement();
    }
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
