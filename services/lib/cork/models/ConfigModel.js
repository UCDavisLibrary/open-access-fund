import {BaseModel} from '@ucd-lib/cork-app-utils';
import ConfigService from '../services/ConfigService.js';
import ConfigStore from '../stores/ConfigStore.js';

class ConfigModel extends BaseModel {

  constructor() {
    super();

    this.store = ConfigStore;
    this.service = ConfigService;

    this.register('ConfigModel');
  }

  getByCategory(category) {
    return this.service.getByCategory(category);
  }

}

const model = new ConfigModel();
export default model;
