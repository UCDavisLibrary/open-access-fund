import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class SubmissionStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      submit: new LruStore({name: 'submission.submit'})
    };
    this.events = {};
  }

}

const store = new SubmissionStore();
export default store;
