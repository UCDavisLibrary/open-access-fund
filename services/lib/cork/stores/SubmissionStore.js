import {LruStore} from '@ucd-lib/cork-app-utils';
import BaseStore from './BaseStore.js';

class SubmissionStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      submit: new LruStore({name: 'submission.submit'}),
      statusList: new LruStore({name: 'submission.statusList'}),
      query: new LruStore({name: 'submission.query'}),
      statusCount: new LruStore({name: 'submission.statusCount'}),
      get: new LruStore({name: 'submission.get'})
    };
    this.events = {};

    this.errorSettings = {
      'submission.statusList': {
        message: 'Unable to retrieve list of submission statuses'
      },
      'submission.query': {
        message: 'Unable to query submissions'
      },
      'submission.statusCount': {
        message: 'Unable to retrieve submission status counts'
      },
      'submission.get': {
        message: 'Unable to retrieve submission'
      }
    }
  }

}

const store = new SubmissionStore();
export default store;
