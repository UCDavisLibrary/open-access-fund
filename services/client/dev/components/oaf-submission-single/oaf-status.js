import { LitElement } from 'lit';
import {render, renderUpdateForm, styles} from "./oaf-status.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import AppComponentController from '../../controllers/AppComponentController.js';
import ScrollController from '../../controllers/ScrollController.js';
import { WaitController } from '@ucd-lib/theme-elements/utils/controllers/wait.js';

export default class OafStatus extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      payload: { type: Object },
      submissionId: {type: String, attribute: 'submission-id'},
      submission: { state: true },
      statusOptions: {state: true}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.renderUpdateForm = renderUpdateForm.bind(this);
    this.submissionId = null;
    this.submission = null;
    this.statusOptions = [];
    this.payload = {};

    this.appComponentController = new AppComponentController(this);
    this.scrollCtl = new ScrollController(this);
    this.waitCtl = new WaitController(this);

    this._injectModel('AppStateModel', 'SubmissionModel', 'AuthModel');
  }

  async _onAppStateUpdate(e) {
    if ( !this.appComponentController.isOnActivePage ) return;
    this.payload = {};
    this.submissionId = e.location.path[1];
    this.getSubmission();
    this.getStatusOptions();
  }

  async getStatusOptions(){
    const r = await this.SubmissionModel.statusList({excludeArchived: true});
    if ( r.state !== 'loaded' ) return;
    this.statusOptions = JSON.parse(JSON.stringify(r.payload));
  }

  async getSubmission(){
    if ( !this.submissionId ) {
      this.submission = null;
      return;
    }
    const r = await this.SubmissionModel.get(this.submissionId);
    if ( r?.state !== 'loaded' ) return;
    this.submission = r.payload;
  }

  _onUpdateClick() {
    this.payload = {
      status: this.submission?.status?.name,
      disableEmail: false,
      comment: '',
      awardAmount: this.submission?.awardAmount || this.submission?.requestedAmount || '',
      accountingSystemNumber: this.submission?.accountingSystemNumber || ''
    };
    this.AppStateModel.showDialogModal({
      title: 'Update Submission Status',
      actions: [
        {text: 'Cancel', value: 'dismiss', invert: true, color: 'secondary'},
        {text: 'Save', value: 'submission-status-update', color: 'secondary'}
      ],
      content: () => this.renderUpdateForm()
    });
  }

  _onAppDialogAction(e) {
    if ( e.action.value !== 'submission-status-update' ) return;
    this.submitPayload();
  }

  _onFormSubmit(e){
    e.preventDefault();
    this.AppStateModel.closeDialogModal();
    this.submitPayload();
  }

  async submitPayload(){
    const r = await this.SubmissionModel.updateStatus(this.submissionId, this.payload);
    if ( r.state === 'error' && r.error?.payload?.validationError ){
      this.AppStateModel.showDialogModal({reloadLast: true});
      return;
    }
    if ( r.state === 'loaded' ) {
      this.AppStateModel.showToast({
        text: 'Submission status updated',
        type: 'success',
        showOnPageLoad: true
      });
      this.AppStateModel.refresh();
    }
  }

  _onPayloadInput(prop, value) {
    this.payload[prop] = value;
    this.AppStateModel.requestDialogUpdate();
  }

}

customElements.define('oaf-status', OafStatus);
