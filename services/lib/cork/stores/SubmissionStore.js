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
      get: new LruStore({name: 'submission.get'}),
      commentCreate: new LruStore({name: 'submission.commentCreate'}),
      commentUpdate: new LruStore({name: 'submission.commentUpdate'}),
      statusUpdate: new LruStore({name: 'submission.statusUpdate'})
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
      },
      'submission.commentCreate': {
        message: 'Unable to create comment',
        showToast: true
      },
      'submission.commentUpdate': {
        message: 'Unable to update comment',
        showToast: true
      },
      'submission.statusUpdate': {
        message: 'Unable to update submission status',
        showToast: true
      }
    }
  }

}

const store = new SubmissionStore();
export default store;
