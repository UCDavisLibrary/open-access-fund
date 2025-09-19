import { LitElement } from 'lit';
import {render, styles} from "./oaf-submission-single.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import AppComponentController from '../../controllers/AppComponentController.js';

export default class OafSubmissionSingle extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      submissionId: {state: true},
      submissionListUrl: {state: true}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.submissionId = null;

    this.appComponentController = new AppComponentController(this);

    this._injectModel('AppStateModel', 'SubmissionModel');
  }

  /**
   * Handle application state updates
   * @returns
   */
  _onAppStateUpdate(e) {
    if ( !this.appComponentController.isOnActivePage ) return;
    this.submissionId = e.location.path[1];
    console.log(this.submissionId);

    if ( e.lastPage === 'home') {
      const qs = new URLSearchParams(e.lastLocation.query);
      this.submissionListUrl = `/?${qs.toString()}`;
    } else {
      this.submissionListUrl = '/';
    }
  }

}

customElements.define('oaf-submission-single', OafSubmissionSingle);
