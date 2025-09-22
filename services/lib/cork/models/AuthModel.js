import {BaseModel} from '@ucd-lib/cork-app-utils';
import AuthService from '../services/AuthService.js';
import AuthStore from '../stores/AuthStore.js';
import config from '../../utils/config.js';

/**
 * @description Model for handling authentication against keycloak
 */
class AuthModel extends BaseModel {

  constructor() {
    super();

    this.store = AuthStore;
    this.service = AuthService;

    this.register('AuthModel');

  }

  /**
   * @description Initializes model. Starts interval for checking session status
   * @returns
   */
  init(){
    if ( this._init ) return;
    this.client = config.appConfig.auth?.keycloakClient;

    if ( !this.client ) {
      this.logger.warn('Failed to initialize AuthModel: No keycloak client found in appConfig');
      return;
    }
    this._init = true;

    setInterval(async () => {
      this.client.updateToken(config.appConfig.auth.tokenRefreshRate);
    }, config.appConfig.auth.loginCheckRefreshRate);

  }

  /**
   * @description Returns access token of logged in user
   * @returns {AccessToken}
   */
  get token(){
    return this.store.token;
  }

  /**
   * @description Checks if user has write access to the application
   * @returns {boolean}
   */
  get userHasWriteAccess(){
    return this.token?.hasWriteAccess;
  }

  get userId(){
    return this.token?.id;
  }

  /**
   * @description Caches the user's access token on the server if they have basic access
   * @returns
   */
  cacheToken(){
    return this.service.cacheToken();
  }

  /**
   * @description Logs user out of application
   */
   logout(){
    const redirectUri = window.location.origin + '/logged-out.html';
    try {
      this.client.logout({redirectUri});
    } catch (e) {
      window.location = redirectUri;
    }
  }

  /**
   * @description Send user to "unauthorized" page
   */
  redirectUnauthorized(){
    window.location = window.location.origin + '/unauthorized.html';
  }

  /**
   * @description Fires when a token has been successfully refreshed
   */
  _onAuthRefreshSuccess(){
    this.store.setToken(this.client.tokenParsed);
    if ( !this.store.token.hasAccess ){
      this.redirectUnauthorized();
    }
  }

  /**
   * @description Logs user out if access token fails to refresh (their session expired)
   */
   _onAuthRefreshError(){
    this.logout();
  }

}

const model = new AuthModel();
export default model;
