import {BaseModel} from '@ucd-lib/cork-app-utils';
import SubmissionService from '../services/SubmissionService.js';
import SubmissionStore from '../stores/SubmissionStore.js';

class SubmissionModel extends BaseModel {

  constructor() {
    super();

    this.store = SubmissionStore;
    this.service = SubmissionService;

    this.register('SubmissionModel');
  }

  submit(data) {
    return this.service.submit(data);
  }

}

const model = new SubmissionModel();
export default model;
