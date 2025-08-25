import pgClient from '../utils/pgClient.js';
import config from '../utils/config.js';
import models from './index.js';

class Submission {

  async create(data){
    const client = await pgClient.pool.connect();
    try {
      await client.query('BEGIN');

      if ( data.submission_status_id ){
        let r = await models.submissionStatus.getIdByName(data.submission_status_id);
        if ( r.error ) return r;
        data.submission_status_id = r.res;
      }

      // write to submission table
      // TODO - change to includeFields
      const excludeFields = ['created_at','updated_at','submission_id', 'author_comment'];
      const d = pgClient.prepareObjectForInsert(data, { excludeFields });
      const sql = `INSERT INTO ${config.db.tables.submission} (${d.keysString}) VALUES (${d.placeholdersString}) RETURNING submission_id`;
      let result = await client.query(sql, d.values);
      const submissionId = result.rows[0].submission_id;



      await client.query('COMMIT');

      return { res: { submissionId } };
    } catch (error) {
      await client.query('ROLLBACK');
      return { error };
    } finally {
      client.release();
    }
  }
}


export default new Submission();
