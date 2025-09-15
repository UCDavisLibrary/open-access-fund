import { LitElement } from 'lit';
import {render, styles} from "./oaf-submission-query.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

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
  }

}

customElements.define('oaf-submission-query', OafSubmissionQuery);
