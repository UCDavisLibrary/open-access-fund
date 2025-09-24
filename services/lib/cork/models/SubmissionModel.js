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

  async statusCount() {
    return this.service.statusCount();
  }

  async get(id) {
    return this.service.get(id);
  }

  async createComment(data) {
    const r = await this.service.createComment(data);
    this.ValidationModel.notify('comment', r);
    if ( r?.state === 'loaded' ){
      this.clearCache();
    }
    return r;
  }

  async updateComment(data) {
    const r = await this.service.updateComment(data);
    this.ValidationModel.notify('comment', r);
    if ( r?.state === 'loaded' ){
      this.clearCache();
    }
    return r;
  }

  async updateStatus(id, data) {
    const r = await this.service.updateStatus(id, data);
    this.ValidationModel.notify('status', r);
    if ( r?.state === 'loaded' ){
      this.clearCache();
    }
    return r;
  }

  clearCache(){
    this.store.data.get.purge();
    this.store.data.query.purge();
    this.store.data.statusCount.purge();
  }

}

const model = new SubmissionModel();
export default model;
