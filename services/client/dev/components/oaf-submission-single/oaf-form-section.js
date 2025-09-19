import { LitElement } from 'lit';
import {render, styles} from "./oaf-form-section.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import AppComponentController from '../../controllers/AppComponentController.js';

export default class OafFormSection extends Mixin(LitElement)
  .with(LitCorkUtils) {


  static get properties() {
    return {
      headingIcon: {type: String, attribute: 'heading-icon'},
      headingText: {type: String, attribute: 'heading-text'}

    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.headingIcon = '';
    this.headingText = '';

    this.appComponentController = new AppComponentController(this);

    this._injectModel('AppStateModel');
  }

}

customElements.define('oaf-form-section', OafFormSection);
