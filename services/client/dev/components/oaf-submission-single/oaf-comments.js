import { LitElement } from 'lit';
import {render, styles} from "./oaf-comments.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import AppComponentController from '../../controllers/AppComponentController.js';

export default class OafComments extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      submissionId: {type: String, attribute: 'submission-id'},
      submission: { state: true }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.submissionId = null;
    this.submission = null;


    this.appComponentController = new AppComponentController(this);
    this._injectModel('AppStateModel', 'SubmissionModel', 'AuthModel');
  }

  willUpdate(props){
    if ( props.has('submissionId') ) {
      this.getSubmission();
    }
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

  _onEditClick(comment) {
    console.log('todo: edit comment', comment);
  }

}

customElements.define('oaf-comments', OafComments);
