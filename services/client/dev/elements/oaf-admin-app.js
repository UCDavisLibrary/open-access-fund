import { LitElement } from 'lit';
import {render, styles} from "./oaf-admin-app.tpl.js";

// global css
import '../css/index.js';

// theme elements
import '@ucd-lib/theme-elements/brand/ucd-theme-primary-nav/ucd-theme-primary-nav.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-header/ucd-theme-header.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-branding-bar/ucdlib-branding-bar.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js';

// app elements
import '../components/cork-app-error.js';
import '../components/cork-app-loader.js';

import { Registry, LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import config from '../../../lib/utils/config.js';

// cork models
import AppStateModel from '../../../lib/cork/models/AppStateModel.js';
import AuthModel from '../../../lib/cork/models/AuthModel.js';
import '../../../lib/cork/models/IconModel.js';
import '../../../lib/cork/models/SubmissionModel.js';
import '../../../lib/cork/models/ValidationModel.js';

import Keycloak from 'keycloak-js';

Registry.ready();

export default class OafAdminApp extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      page: {type: String},
      _firstAppStateUpdate : { state: true }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.page = '';
    this._firstAppStateUpdate = false;

    this._injectModel('AppStateModel', 'AuthModel');
  }

  /**
   * @description Custom element lifecyle event
   * Hide the loading screen and show the app when the element is connected
   */
  connectedCallback(){
    super.connectedCallback();
    AppStateModel.refresh();
  }

  async _onAppStateUpdate(e) {
    this.logger.info('appStateUpdate', e);
    if ( !this._firstAppStateUpdate ) {
      this._firstAppStateUpdate = true;
      this.hideFullSiteLoader();
    }
    this.closeNav();
    const { page, location } = e;
    this.page = page;

    if ( this.page === 'logout' ) {
      AuthModel.logout();
      return;
    }
  }


  /**
   * @description Hide the full site loader after a timeout
   * @param {*} timeout
   */
  async hideFullSiteLoader(timeout=300){
    await new Promise(resolve => setTimeout(resolve, timeout));
    document.querySelector('#site-loader').style.display = 'none';
    this.style.display = 'block';
  }

  /**
   * @description Close the app's primary nav menu
   */
  closeNav(){
    let ele = this.renderRoot.querySelector('ucd-theme-header');
    if ( ele ) {
      ele.close();
    }
    ele = this.renderRoot.querySelector('ucd-theme-quick-links');
    if ( ele ) {
      ele.close();
    }
  }

}

// Check for basic authorization, and initialize the app
(async () => {

  // instantiate keycloak instance and save in appConfig global (services know to look here when adding auth headers)
  const authConfig = config.appConfig.auth;
  authConfig.keycloakClient = new Keycloak({...authConfig.clientInit, checkLoginIframe: true});
  const kc = authConfig.keycloakClient;
  const silentCheckSsoRedirectUri = `${window.location.origin}/${authConfig.silentCheckSsoRedirectUri}`

  // set up listeners keycloak listeners
  kc.onAuthRefreshError = () => {AuthModel.logout();};
  kc.onAuthError = () => {AuthModel.redirectUnauthorized();};
  kc.onAuthSuccess = async () => {
    const r = await AuthModel.cacheToken();
    if ( r.state !== 'loaded' ) {
      AuthModel.redirectUnauthorized();
      return;
    }
    customElements.define('oaf-admin-app', OafAdminApp);
    AuthModel.init();
    AuthModel._onAuthRefreshSuccess();
  };
  kc.onAuthRefreshSuccess = () => {AuthModel._onAuthRefreshSuccess();};

  // initialize auth
  await kc.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri,
    scope: authConfig.oidcScope
  });
  if ( !kc.authenticated) {
    await kc.login();
  }

})();


