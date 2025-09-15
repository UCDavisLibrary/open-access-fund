import {LruStore} from '@ucd-lib/cork-app-utils';
import BaseStore from './BaseStore.js';

class SubmissionStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      submit: new LruStore({name: 'submission.submit'}),
      statusList: new LruStore({name: 'submission.statusList'})
    };
    this.events = {};

    this.errorSettings = {
      'submission.statusList': {
        message: 'Unable to retrieve list of submission statuses'
      }
    }
  }

}

const store = new SubmissionStore();
export default store;
