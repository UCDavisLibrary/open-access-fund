import {PayloadUtils} from '@ucd-lib/cork-app-utils'

const ID_ORDER = [
  'category', 'action'
];

let inst = new PayloadUtils({
  idParts: ID_ORDER
});

export default inst;
