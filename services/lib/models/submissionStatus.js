import pgClient from '../utils/pgClient.js';
import config from '../utils/config.js';

class SubmissionStatus {

  constructor(){
    this.nameToId = {};
  }

  /**
   * @description Query for submission statuses
   * @param {Object} queryParams - Query parameters
   * @param {Boolean} queryParams.excludeArchived - Exclude archived statuses
   * @param {Boolean} queryParams.archivedOnly - Only include archived statuses
   * @param {*} opts
   * @returns
   */
  async list(queryParams={}, opts={}){
    const whereArgs = {...queryParams, '1': '1'};
    if ( queryParams.excludeArchived ){
      whereArgs.archived = false;
      delete whereArgs.excludeArchived;
    } else if ( queryParams.archivedOnly ){
      whereArgs.archived = true;
      delete whereArgs.archivedOnly;
    }

    const whereClause = pgClient.toWhereClause(whereArgs);
    const sql = `SELECT * FROM ${config.db.tables.submissionStatus} WHERE ${whereClause.sql} ORDER BY status_id`;
    return pgClient.query(sql, whereClause.values);
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
