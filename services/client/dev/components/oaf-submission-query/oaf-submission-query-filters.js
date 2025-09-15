import { LitElement } from 'lit';
import {render, styles} from "./oaf-submission-query-filters.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import payloadUtils from '../../../../lib/cork/payload.js';

import AppComponentController from '../../controllers/AppComponentController.js';

export default class OafSubmissionQueryFilters extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      statusListQuery: {state: true},
      statusOptions: {state: true}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.appComponentController = new AppComponentController(this);

    this.statusListQuery = {excludeArchived: true};
    this.statusOptions = [];

    this.render = render.bind(this);

    this._injectModel('AppStateModel', 'SubmissionModel');
  }

  _onAppStateUpdate(e) {
    if ( !this.appComponentController.isOnActivePage ) return;
    this.SubmissionModel.statusList(this.statusListQuery);
  }

  _onSubmissionStatuslistUpdate(e) {
    if ( !this.appComponentController.isOnActivePage || e.state !== 'loaded' ) return;
    const id = payloadUtils.getKey({action: 'statusList', ...this.statusListQuery});
    if ( id !== e.id ) return;
    this.statusOptions = JSON.parse(JSON.stringify(e.payload));
    console.log(this.statusOptions);
  }

}

customElements.define('oaf-submission-query-filters', OafSubmissionQueryFilters);
