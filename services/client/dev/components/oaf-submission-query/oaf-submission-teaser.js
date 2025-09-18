import { LitElement } from 'lit';
import {render, styles} from "./oaf-submission-teaser.tpl.js";

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

export default class OafSubmissionTeaser extends Mixin(LitElement)
  .with(LitCorkUtils) {


  static get properties() {
    return {
      submission: { type: Object },
      submissionDate: { type: String },
    }
  }

  static get styles() {
    return styles();
  }

  willUpdate(props){
    if ( props.has('submission') ){
      this.setSubmissionDate();
    }
  }

  setSubmissionDate(){
    if ( !this.submission?.createdAt ) return '';
    this.submissionDate = this.submission?.createdAt.split('T')?.[0] || '';
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.submission = {};
  }

}

customElements.define('oaf-submission-teaser', OafSubmissionTeaser);
