import pgClient from '../utils/pgClient.js';
import config from '../utils/config.js';

class SubmissionTransaction {

  async create(data, client){
    let values = [];
    let params = [];
    let columns = [];

    // standard fields
    const fields = ['submission_id', 'transaction_type', 'user_comment_id', 'details', 'created_at'];
    for ( const field of fields ){
      if ( data[field] ){
        values.push(data[field]);
        params.push(`$${values.length}`);
        columns.push(field);
      }
    }

    // special cases
    if ( data.app_user_id ){
      params.push(`get_app_user_id($${values.length + 1})`);
      values.push(data.app_user_id);
      columns.push('app_user_id');
    }

    if ( data.transaction_type === 'status-update' ){
      params.push(`get_submission_status_id($${values.length + 1})`);
      values.push(data.transaction_subtype);
      columns.push('transaction_subtype');
    } else {
      params.push(`$${values.length + 1}`);
      values.push(data.transaction_subtype);
      columns.push('transaction_subtype');
    }

    if ( data.previous_status ){
      params.push(`get_submission_status_id($${values.length + 1})`);
      values.push(data.previous_status);
      columns.push('previous_status');
    } else {
      params.push(`$${values.length + 1}`);
      values.push(data.previous_status);
      columns.push('previous_status');
    }

    let sql = `INSERT INTO ${config.db.tables.submissionTransaction} (
      ${columns.join(', ')}
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

  async get(id) {
    const sql = `SELECT * FROM ${config.db.tables.submissionTransaction} WHERE transaction_id=$1`;
    const values = [id];
    const result = await pgClient.query(sql, values);
    if ( result.error ) return result;
    if ( result.res.rows.length === 0 ) return { res: null };
    return { res: result.res.rows[0] };
  }
}

export default new SubmissionTransaction();
