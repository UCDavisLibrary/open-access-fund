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
}


export default new Submission();
