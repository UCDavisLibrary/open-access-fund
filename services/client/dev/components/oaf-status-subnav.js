import { LitElement } from 'lit';
import {render} from "./oaf-status-subnav.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import AppComponentController from '../controllers/AppComponentController.js';

export default class OafStatusSubnav extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      statuses: {type: Array},
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.statuses = [];

    this.appComponentController = new AppComponentController(this);

    this._injectModel('AppStateModel', 'SubmissionModel');
  }

  /**
   * Handle application state updates
   * @returns
   */
  _onAppStateUpdate() {
    if ( !this.appComponentController.isOnActivePage ) return;
    this.SubmissionModel.statusCount();
  }

  /**
   * @description Handle updates to submission status counts
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onSubmissionStatuscountUpdate(e) {
    if ( e.state !== 'loaded' ) return;
    this.statuses = ['submitted', 'pending', 'accounting', 'completed', 'denied', 'withdrawn', 'deleted'].map(s => {
      return e.payload.find(d => d.name === s);
    }).filter(s => s);
  }

}

customElements.define('oaf-status-subnav', OafStatusSubnav);
