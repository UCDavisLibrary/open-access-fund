import pgClient from '../utils/pgClient.js';
import config from '../utils/config.js';
import models from './index.js';

class Submission {

  async create(data){
    const client = await pgClient.pool.connect();
    try {
      await client.query('BEGIN');

      // convert submission_status_id from name to id if needed
      if ( data.submission_status_id ){
        let r = await models.submissionStatus.getIdByName(data.submission_status_id);
        if ( r.error ) return r;
        data.submission_status_id = r.res;
      }

      // write to submission table
      const excludeFields = ['submission_id', 'author_comment'];
      const d = pgClient.prepareObjectForInsert(data, { excludeFields });
      const sql = `INSERT INTO ${config.db.tables.submission} (${d.keysString}) VALUES (${d.placeholdersString}) RETURNING submission_id, created_at`;
      let result = await client.query(sql, d.values);
      const submissionId = result.rows[0].submission_id;
      const createdAt = result.rows[0].created_at;

      // write author comment if provided
      let commentId;
      if ( data.author_comment ) {
        const commentData = {
          submission_id: submissionId,
          comment_text: data.author_comment,
          is_from_author: true,
          created_at: createdAt,
          updated_at: createdAt
        };
        const cd = pgClient.prepareObjectForInsert(commentData);
        const commentSql = `INSERT INTO ${config.db.tables.userComment} (${cd.keysString}) VALUES (${cd.placeholdersString}) RETURNING user_comment_id`;
        const commentResult = await client.query(commentSql, cd.values);
        commentId = commentResult.rows[0].user_comment_id;
      }

      // write submission transaction
      const submissionTransactionData = {
        submission_id: submissionId,
        transaction_type: 'status-update',
        transaction_subtype: 'submitted',
        user_comment_id: commentId,
        created_at: createdAt
      };
      await models.submissionTransaction.create(submissionTransactionData, client);

      await client.query('COMMIT');

      return { res: { submissionId } };
    } catch (error) {
      await client.query('ROLLBACK');
      return { error };
    } finally {
      client.release();
    }
  }

  /**
   * @description Get a single submission by id
   * @param {String} id - submission id
   * @returns
   */
  async get(id){
    const sql = `
      SELECT submission_json
      FROM submission_detailed_json_v
      WHERE submission_id = $1;
    `;
    const r = await pgClient.query(sql, [id]);
    if ( r.error ) return r;
    return { res: r.res.rows?.[0]?.submission_json || null };
  }

  async query(params={}){
    const perPage = parseInt(config.adminApp.submissionPaginationSize.value);
    const page = params.page || 1;
    const offset = (page - 1) * perPage;


    const where = [];
    const values = [];
    let i = 1;

    // Status
    if (Array.isArray(params.status) && params.status.length) {
      where.push(`
        s.submission_status_id IN (
          SELECT get_submission_status_id(x)
          FROM unnest($${i++}::text[]) AS t(x)
        )
      `);
      values.push(params.status);
    }

    // Submission date
    if (params.submittedAfter) {
      where.push(`s.created_at >= $${i++}`);
      values.push(params.submittedAfter);
    }
    if (params.submittedBefore) {
      where.push(`s.created_at <= $${i++}`);
      values.push(params.submittedBefore);
    }

    // Keyword search
    if (params.keyword) {
      where.push(`s.tsv_content @@ websearch_to_tsquery('english', $${i++})`);
      values.push(params.keyword);
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // get total count
    const countSQL = `
      SELECT COUNT(*)::int AS count
      FROM submission_simple_json_v v
      JOIN submission s ON s.submission_id = v.submission_id
      ${whereSQL};
    `;
    let r = await pgClient.query(countSQL, values);
    if ( r.error ) return r;
    const total = r.res.rows?.[0]?.count ?? 0;

    // get paginated results
    const resultsSQL = `
      SELECT v.*
      FROM submission_simple_json_v v
      JOIN submission s ON s.submission_id = v.submission_id
      ${whereSQL}
      ORDER BY s.created_at DESC, s.submission_id DESC
      LIMIT $${i++} OFFSET $${i++};
    `;
    r = await pgClient.query(resultsSQL, [...values, perPage, offset]);
    if ( r.error ) return r;
    const results = r.res.rows.map(r => r.submission_json);
    const totalPages = Math.ceil(total / perPage);

    return { res: { total, page, perPage, results, totalPages } };
  }

  async getCountByStatus(){
    const sql = `
      SELECT ss.*, COUNT(s.submission_id)::int AS count
      FROM submission_status ss
      LEFT JOIN submission s ON s.submission_status_id = ss.status_id
      GROUP BY ss.status_id
      ORDER BY ss.created_at ASC;
    `;
    return pgClient.query(sql);
  }

  async submissionIsStatus(id, statusIdOrName){
    const sql = `
      SELECT COUNT(*)::int AS count
      FROM submission s
      WHERE s.submission_id = $1
      AND s.submission_status_id = get_submission_status_id($2);
    `;
    const r = await pgClient.query(sql, [id, statusIdOrName]);
    if ( r.error ) return r;
    return { res: r.res.rows?.[0]?.count === 1 };
  }

  async update(submissionId, data, userData, client ){
    let isDedicatedClient = false;
    try {
      if ( !client ) {
        isDedicatedClient = true;
        client = await pgClient.pool.connect();
        await client.query('BEGIN');
      }

      // get original submission data
      let existingValues = await client.query(
        `SELECT * FROM ${config.db.tables.submission} WHERE submission_id=$1`,
        [submissionId]
      );
      if ( !existingValues.rowCount ) {
        throw new Error('Submission not found');
      }
      existingValues = existingValues.rows[0];

      // write to submission table
      const d = pgClient.prepareObjectForUpdate(data);
      const sql = `UPDATE ${config.db.tables.submission} SET ${d.sql} WHERE submission_id=$${d.values.length + 1}`;
      await client.query(sql, [...d.values, submissionId]);

      // update user, if provided
      let userId;
      if ( userData ){
        userId = await models.user.upsert(userData, client);
      }

      // write transactions if any values changed
      for ( const field of Object.keys(data) ) {
        let previousValue = existingValues[field];
        let newValue = data[field];

        if ( field === 'fund_account' ){
          // todo: compare fund account objects
          continue;
        }
        if ( newValue != previousValue ) {
          const submissionTransactionData = {
            submission_id: submissionId,
            transaction_type: 'field-update',
            transaction_subtype: field,
            app_user_id: userId,
            details: {
              previousValue,
              newValue
            }
          };
          await models.submissionTransaction.create(submissionTransactionData, client);
        }
      }

      if ( isDedicatedClient ) {
        await client.query('COMMIT');
      }

      return { res: { success: true } };
    } catch (error) {
      if ( isDedicatedClient ) {
        await client.query('ROLLBACK');
        return { error };
      } else {
        throw error;
      }
    } finally {
      if ( isDedicatedClient ) {
        client.release();
      }
    }
  }

  async updateStatus(submissionId, newStatus, userData, comment, client ){
    let isDedicatedClient = false;
    let r;
    try {
      if ( !client ) {
        isDedicatedClient = true;
        client = await pgClient.pool.connect();
        await client.query('BEGIN');
      }

      // get original submission data
      let ogSubmission = await this.get(submissionId);
      if ( ogSubmission.error ) {
        throw ogSubmission.error;
      }
      ogSubmission = ogSubmission.res;
      if ( !ogSubmission ) {
        throw new Error('Submission not found');
      }

      // write comment, if provided.
      let commentId;
      if ( comment ) {
        r = await models.comment.create(
          {submission_id: submissionId, comment_text: comment},
          userData,
          true,
          client
        );
        if ( r.error ) throw r.error;
        commentId = r.res.userCommentId;
      }

      // update user, if provided
      let userId;
      if ( userData ){
        userId = await models.user.upsert(userData, client);
      }

      // update submission status
      const sql = `UPDATE ${config.db.tables.submission} SET submission_status_id=get_submission_status_id($1) WHERE submission_id=$2`;
      r = await client.query(sql, [newStatus, submissionId]);

      // write submission transaction
      const submissionTransactionData = {
        submission_id: submissionId,
        transaction_type: 'status-update',
        app_user_id: userId,
        transaction_subtype: newStatus,
        user_comment_id: commentId,
        previous_status: ogSubmission.status?.statusId || null
      };
      await models.submissionTransaction.create(submissionTransactionData, client);

      if ( isDedicatedClient ) {
        await client.query('COMMIT');
      }

      return { res: { success: true } };
    } catch (error) {
      if ( isDedicatedClient ) {
        await client.query('ROLLBACK');
        return { error };
      } else {
        throw error;
      }
    } finally {
      if ( isDedicatedClient ) {
        client.release();
      }
    }
  }
}


export default new Submission();
