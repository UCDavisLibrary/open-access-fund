import { IconModel as BaseModel } from '@ucd-lib/cork-icon';
import IconService from '../services/IconService.js';
import IconStore from '../stores/IconStore.js';

class IconModel extends BaseModel {

  constructor() {
    super();

    this.store = IconStore;
    this.service = IconService;
  }

}

const model = new IconModel();
export default model;
