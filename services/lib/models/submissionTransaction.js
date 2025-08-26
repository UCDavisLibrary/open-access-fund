import pgClient from '../utils/pgClient.js';
import config from '../utils/config.js';

class SubmissionTransaction {

  async create(data, client){
    // const excludeFields = ['transaction_id'];
    // const d = pgClient.prepareObjectForInsert(data, { excludeFields });
    // const sql = `INSERT INTO ${config.db.tables.submissionTransaction} (${d.keysString}) VALUES (${d.placeholdersString}) RETURNING transaction_id`;

    let values = [
      data.submission_id,
      data.transaction_type,
      data.user_comment_id,
      data.details,
      data.created_at,
      data.app_user_id,
      data.transaction_subtype,
      data.previous_status
    ];
    let params = [
      '$1', '$2', '$3', '$4', '$5'
    ];

    if ( data.app_user_id ){
      params.push('get_app_user_id($6)');
    } else {
      params.push('$6');
    }

    if ( data.transaction_type === 'status-update' ){
      params.push('get_submission_status_id($7)');
    } else {
      params.push('$7');
    }

    if ( data.previous_status ){
      params.push('get_submission_status_id($8)');
    } else {
      params.push('$8');
    }

    let sql = `INSERT INTO ${config.db.tables.submissionTransaction} (
      submission_id,
      transaction_type,
      user_comment_id,
      details,
      created_at,
      app_user_id,
      transaction_subtype,
      previous_status
    ) VALUES (${params.join(', ')}) RETURNING transaction_id
    ` ;

    // part of transaction
    if ( client ) {
      const result = await client.query(sql, values);
      const transactionId = result.rows[0].transaction_id;
      return transactionId;

    // standalone
    } else {
      const result = await pgClient.query(sql, values);
      if ( result.error ) return result;
      const transactionId = result.res.rows[0].transaction_id;
      return { res: { transactionId } };
    }
  }
}

export default new SubmissionTransaction();
