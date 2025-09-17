import {BaseModel} from '@ucd-lib/cork-app-utils';
import SubmissionService from '../services/SubmissionService.js';
import SubmissionStore from '../stores/SubmissionStore.js';

class SubmissionModel extends BaseModel {

  constructor() {
    super();

    this.store = SubmissionStore;
    this.service = SubmissionService;

    this.register('SubmissionModel');

    this.inject('ValidationModel');
  }

  async submit(data, recaptchaToken) {
    const r = await this.service.submit(data, recaptchaToken);
    this.ValidationModel.notify('submission', r);
    return r;
  }

  async statusList(query={}) {
    return this.service.statusList(query);
  }

  async query(query={}) {
    return this.service.query(query);
  }

}

const model = new SubmissionModel();
export default model;
