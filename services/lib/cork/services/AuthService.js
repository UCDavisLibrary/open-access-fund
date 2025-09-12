import BaseService from './BaseService.js';
import AuthStore from '../stores/AuthStore.js';

import payload from '../payload.js';
import config from '../../utils/config.js';

class AuthService extends BaseService {

  constructor() {
    super();
    this.store = AuthStore;
  }

  get baseUrl(){
    return `${config.appConfig.host}/${config.appConfig.apiRoot}/auth`;
  }

  async cacheToken(){
    let ido = {action: 'cache-token'};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.cacheToken,
      () => this.request({
        url : `${this.baseUrl}/cache-token`,
        fetchOptions: {
          method : 'POST'
        },
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          this.store.data.cacheToken
        )
      })
    );

    return this.store.data.cacheToken.get(id);
  }

}

const service = new AuthService();
export default service;
