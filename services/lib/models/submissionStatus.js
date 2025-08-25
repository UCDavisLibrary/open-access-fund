import pgClient from '../utils/pgClient.js';
import config from '../utils/config.js';

class SubmissionStatus {

  constructor(){
    this.nameToId = {};
  }

  async getIdByName(name){
    if ( this.nameToId[name] ) return { res: this.nameToId[name] };
    const sql = `SELECT * FROM get_submission_status_id($1)`;
    const result = await pgClient.query(sql, [name]);
    if ( result.error ) return result;
    this.nameToId[name] = result.res.rows[0].get_submission_status_id;
    return { res: this.nameToId[name] };
  }
}


export default new SubmissionStatus();
