import {BaseService} from '@ucd-lib/cork-app-utils';
import SubmissionStore from '../stores/SubmissionStore.js';

import payload from '../payload.js';
import config from '../../utils/config.js';

class SubmissionService extends BaseService {

  constructor() {
    super();
    this.store = SubmissionStore;
  }

  async submit(data, recaptchaToken) {
    const ido = {action: 'submit'};
    const id = payload.getKey(ido);

    await this.request({
      url : `${config.adminApp.host.value}/submit`,
      fetchOptions: {
        method : 'POST',
        body: data,
        credentials: 'omit',
        headers: {
          'X-Recaptcha-Token': recaptchaToken
        }
      },
      json: true,
      onUpdate : resp => this.store.set(
        payload.generate(ido, resp),
        this.store.data.submit
      )
    });

    return this.store.data.submit.get(id);
  }

}

const service = new SubmissionService();
export default service;
