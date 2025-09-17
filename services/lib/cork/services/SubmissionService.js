import BaseService from './BaseService.js';
import SubmissionStore from '../stores/SubmissionStore.js';

import payload from '../payload.js';
import config from '../../utils/config.js';

class SubmissionService extends BaseService {

  constructor() {
    super();
    this.store = SubmissionStore;
  }

  get baseUrl(){
    return `${config.appConfig.host}/${config.appConfig.apiRoot}`;
  }

  async submit(data, recaptchaToken) {
    const ido = {action: 'submit'};
    const id = payload.getKey(ido);

    await this.request({
      url : `${this.baseUrl}/submit`,
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

  async statusList(query={}) {
    const ido = {action: 'statusList', ...query};
    const id = payload.getKey(ido);
    const store = this.store.data.statusList;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/submission-status`,
        qs: query,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          store
        )
      })
    );
    return store.get(id);
  }

  async query(query={}) {
    const ido = {action: 'query', ...query};
    const id = payload.getKey(ido);
    const store = this.store.data.query;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/submission/query`,
        qs: query,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          store
        )
      })
    );
    return store.get(id);
  }

}

const service = new SubmissionService();
export default service;
