import { LitElement } from 'lit';
import {render, styles} from "./oaf-admin-app.tpl.js";

import { Registry, LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import config from '../../../lib/utils/config.js';

// cork models
import AuthModel from '../../../lib/cork/models/AuthModel.js';
import '../../../lib/cork/models/SubmissionModel.js';
import '../../../lib/cork/models/ValidationModel.js';

import Keycloak from 'keycloak-js';

Registry.ready();

export default class OafAdminApp extends Mixin(LitElement)
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

  /**
   * @description Custom element lifecyle event
   * Hide the loading screen and show the app when the element is connected
   */
  connectedCallback(){
    super.connectedCallback();
    this.style.display = 'block';
    document.querySelector('#site-loader').style.display = 'none';
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


