import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';
import AccessToken from '../../utils/AccessToken.js';

class AuthStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      cacheToken: new LruStore({name: 'auth.cache-token'})
    };
    this.token = new AccessToken();
    this.events = {
      TOKEN_REFRESHED: 'token-refreshed',
      TOKEN_SERVER_CACHE_CLEARED: 'token-server-cache-cleared'
    };
    this.serverCacheCleared = {};
  }

  setToken(token={}){
    this.token = new AccessToken(token);
    this.emit(this.events.TOKEN_REFRESHED, this.token);
  }

}

const store = new AuthStore();
export default store;
