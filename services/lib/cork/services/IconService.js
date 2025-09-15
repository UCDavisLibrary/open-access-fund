import { createIconService } from '@ucd-lib/cork-icon';
import BaseService from './BaseService.js';
const IconBase = createIconService(BaseService);

import IconStore from '../stores/IconStore.js';
import config from '../../utils/config.js';

class IconService extends IconBase{
  constructor() {
    super();
    this.store = IconStore;

    this.apiDomain = config.appConfig.host;
    this.apiPath = `/${config.appConfig.apiRoot}/icon`;
  }
}

export default new IconService();
