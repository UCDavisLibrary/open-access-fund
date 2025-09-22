import { LitElement } from 'lit';
import {render, styles} from "./oaf-form-section.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { categoryBrands } from "@ucd-lib/theme-sass/colors.js";

import AppComponentController from '../../controllers/AppComponentController.js';

export default class OafFormSection extends Mixin(LitElement)
  .with(LitCorkUtils) {


  static get properties() {
    return {
      headingIcon: {type: String, attribute: 'heading-icon'},
      headingText: {type: String, attribute: 'heading-text'},
      showForm: {type: Boolean, attribute: 'show-form'},
      disableFormView: {type: Boolean, attribute: 'disable-form-view'},
      brandColor: {type: String, attribute: 'brand-color'},
      _brandColorObj: {state: true},
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
    this.brandColor = '';
    this.showForm = false;
    this.disableFormView = false;

    this.appComponentController = new AppComponentController(this);

    this._injectModel('AppStateModel', 'AuthModel');
  }

  willUpdate(props){
    if ( props.has('brandColor') ) {
      this._brandColorObj = Object.values(categoryBrands).find(c => c.id === this.brandColor);
    }
  }

  _onAppStateUpdate() {
    if ( !this.appComponentController.isOnActivePage ) return;
    this.showForm = false;
  }

  _onSaveClick() {
    this.emit( new CustomEvent('form-save', {bubbles: true, composed: true}) );
  }



}

customElements.define('oaf-form-section', OafFormSection);
