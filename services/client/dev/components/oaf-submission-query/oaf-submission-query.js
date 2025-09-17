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

    this._injectModel('AppStateModel', 'SubmissionModel');
  }

  _onAppStateUpdate(e) {
    if ( !this.appComponentController.isOnActivePage ) return;
    this.SubmissionModel.query(e.location?.query);
  }

}

customElements.define('oaf-submission-query', OafSubmissionQuery);
