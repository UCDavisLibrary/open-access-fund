import { LitElement } from 'lit';
import {render, styles} from "./oaf-comments.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import AppComponentController from '../../controllers/AppComponentController.js';
import ScrollController from '../../controllers/ScrollController.js';
import { WaitController } from '@ucd-lib/theme-elements/utils/controllers/wait.js';

export default class OafComments extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      submissionId: {type: String, attribute: 'submission-id'},
      submission: { state: true },
      showWriteInput: { type: Boolean, attribute: 'show-write-input' },
      writeInputValue: { type: String, attribute: 'write-input-value' },
      editedCommentId: { state: true },
      updateSuccessful: { state: true }
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
    this.showWriteInput = false;
    this.editedCommentId = null;
    this.writeInputValue = '';

    this.appComponentController = new AppComponentController(this);
    this.scrollCtl = new ScrollController(this);
    this.waitCtl = new WaitController(this);

    this._injectModel('AppStateModel', 'SubmissionModel', 'AuthModel');
  }

  resetFormState() {
    this.showWriteInput = false;
    this.editedCommentId = null;
    this.writeInputValue = '';
    this.updateSuccessful = false;
  }

  _onAppStateUpdate() {
    if ( !this.appComponentController.isOnActivePage ) return;
    this.getSubmission();
    if ( this.updateSuccessful ) {
      this.scrollCtl.scrollToLastPagePosition();
    }
    this.resetFormState();
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

  async _onEditClick(comment) {
    this.showWriteInput = true;
    this.editedCommentId = comment.userCommentId;
    this.writeInputValue = comment.commentText;

    await this.waitCtl.waitForUpdate();
    await this.waitCtl.waitForFrames(3);
    this.renderRoot.querySelector('textarea')?.focus();
  }

  async _onAddClick() {
    this.showWriteInput = true;
    this.editedCommentId = null;
    this.writeInputValue = '';
    await this.waitCtl.waitForUpdate();
    await this.waitCtl.waitForFrames(3);
    this.renderRoot.querySelector('textarea')?.focus();
  }

  async _onWriteSubmit() {
    if ( !this.writeInputValue ) return;
    let r;
    if ( this.editedCommentId) {
      r = await this.SubmissionModel.updateComment({
        userCommentId: this.editedCommentId,
        commentText: this.writeInputValue
      });
    } else {
      r = await this.SubmissionModel.createComment({
        submissionId: this.submissionId,
        commentText: this.writeInputValue
      });
    }

    if ( r?.state === 'loaded' ) {
      this.updateSuccessful = true;
      this.AppStateModel.showToast({
        text: this.editedCommentId ? 'Comment updated' : 'Comment added',
        type: 'success',
        showOnPageLoad: true
      });
      this.AppStateModel.refresh();
    }
  }

  _onWriteCancel() {
    this.resetFormState();
  }

}

customElements.define('oaf-comments', OafComments);
