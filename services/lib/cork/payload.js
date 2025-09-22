import {PayloadUtils} from '@ucd-lib/cork-app-utils'

const ID_ORDER = [
  'category', 'action', 'excludeArchived', 'page',
  'status', 'submittedAfter', 'submittedBefore', 'keyword', 'id'
];

let inst = new PayloadUtils({
  idParts: ID_ORDER
});

export default inst;
