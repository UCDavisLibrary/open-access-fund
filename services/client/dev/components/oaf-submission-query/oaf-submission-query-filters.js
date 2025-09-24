import { LitElement } from 'lit';
import {render, styles} from "./oaf-submission-query-filters.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import payloadUtils from '../../../../lib/cork/payload.js';

import AppComponentController from '../../controllers/AppComponentController.js';
import QueryStringController from '../../controllers/QueryStringController.js';

export default class OafSubmissionQueryFilters extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      statusOptions: {state: true}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.appComponentController = new AppComponentController(this);
    this.qsCtl = new QueryStringController(this, {types: {status: 'array'}});

    this.statusOptions = [];

    this.render = render.bind(this);

    this._injectModel('AppStateModel', 'SubmissionModel');
  }

  _onAppStateUpdate(e) {
    if ( !this.appComponentController.isOnActivePage ) return;
    this.getStatusOptions();
  }

  async getStatusOptions(){
    const r = await this.SubmissionModel.statusList({excludeArchived: true});
    if ( r.state !== 'loaded' ) return;
    this.statusOptions = JSON.parse(JSON.stringify(r.payload));
  }

  _onFilterUpdate(filter, value){
    this.qsCtl.deleteParam('page');
    this.qsCtl.setParam(filter, value);
    if ( this.timeout ) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.qsCtl.setLocation();
    }, 400);
  }

  _onSubmit(e) {
    e.preventDefault();
    if ( this.timeout ) clearTimeout(this.timeout);
    this.qsCtl.setLocation();
  }

}

customElements.define('oaf-submission-query-filters', OafSubmissionQueryFilters);
