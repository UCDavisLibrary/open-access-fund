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
      const excludeFields = ['created_at','updated_at','submission_id', 'author_comment'];
      const d = pgClient.prepareObjectForInsert(data, { excludeFields });
      const sql = `INSERT INTO ${config.db.tables.submission} (${d.keysString}) VALUES (${d.placeholdersString}) RETURNING submission_id`;
      let result = await client.query(sql, d.values);
      const submissionId = result.rows[0].submission_id;

      // write author comment if provided
      let commentId;
      if ( data.author_comment ) {
        const commentData = {
          submission_id: submissionId,
          comment_text: data.author_comment,
          is_from_author: true
        };
        const cd = pgClient.prepareObjectForInsert(commentData);
        const commentSql = `INSERT INTO user_comment (${cd.keysString}) VALUES (${cd.placeholdersString}) RETURNING user_comment_id`;
        const commentResult = await client.query(commentSql, cd.values);
        commentId = commentResult.rows[0].user_comment_id;
      }

      // write submission transaction
      const submissionTransactionData = {
        submission_id: submissionId,
        transaction_type: 'submit',
        user_comment_id: commentId
      };
      const std = pgClient.prepareObjectForInsert(submissionTransactionData);
      const submissionTransactionSql = `INSERT INTO submission_transaction (${std.keysString}) VALUES (${std.placeholdersString})`;
      await client.query(submissionTransactionSql, std.values);

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
