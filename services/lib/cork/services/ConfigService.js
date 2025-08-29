import {BaseService} from '@ucd-lib/cork-app-utils';
import ConfigStore from '../stores/ConfigStore.js';

import payload from '../payload.js';
import config from '../../utils/config.js';

class ConfigService extends BaseService {

  constructor() {
    super();
    this.store = ConfigStore;
  }

  get baseUrl(){
    return `${config.adminApp.host.value}/config`;
  }

  async getByCategory(category){
    let ido = {category};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.getByCategory,
      () => this.request({
        url : `${this.baseUrl}/${category}`,
        checkCached : () => this.store.data.getByCategory.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          this.store.data.getByCategory
        ),
        fetchOptions: {
          credentials: 'omit'
        }
      })
    );

    return this.store.data.getByCategory.get(id);
  }

}

const service = new ConfigService();
export default service;
