import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class ConfigStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      getByCategory: new LruStore({name: 'config.get-by-category'})
    };
    this.events = {};
  }

}

const store = new ConfigStore();
export default store;
