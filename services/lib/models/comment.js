import pgClient from '../utils/pgClient.js';
import config from '../utils/config.js';
import models from './index.js';

class Comment {
  async create(commentData, userData, noTransaction, client) {
    let isDedicatedClient = false;
    if ( !client ) {
      isDedicatedClient = true;
      client = await pgClient.pool.connect();
    }
    try {
      if ( isDedicatedClient ) {
        await client.query('BEGIN');
      }

      let userId;
      if ( userData ){
        userId = await models.user.upsert(userData, client);
      }

      const d = pgClient.prepareObjectForInsert({
        submission_id: commentData.submission_id,
        app_user_id: userId,
        comment_text: commentData.comment_text
      });

      const sql = `INSERT INTO ${config.db.tables.userComment} (${d.keysString}) VALUES (${d.placeholdersString}) RETURNING user_comment_id`;
      let result = await client.query(sql, d.values);
      const userCommentId = result.rows[0].user_comment_id;

      // transaction log
        if ( !noTransaction ) {
        const transactionData = {
          submission_id: commentData.submission_id,
          transaction_type: 'comment',
          app_user_id: userId,
          transaction_subtype: 'create',
          user_comment_id: userCommentId
        };
        await models.submissionTransaction.create(transactionData, client);
      }

      if ( isDedicatedClient ) {
        await client.query('COMMIT');
      }

      return { res: { userCommentId } };
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

  async update(commentId, commentText, client) {
    let isDedicatedClient = false;
    if ( !client ) {
      isDedicatedClient = true;
      client = await pgClient.pool.connect();
    }
    try {
      if ( isDedicatedClient ) {
        await client.query('BEGIN');
      }

      let existingComment = await this.get(commentId);
      existingComment = existingComment.res;

      const sql = `UPDATE ${config.db.tables.userComment} SET comment_text=$1 WHERE user_comment_id=$2`;
      const values = [commentText, commentId];
      const result = await client.query(sql, values);
      if ( result.error ){
        throw result.error;
      }

      // transaction log
      const transactionData = {
        submission_id: existingComment.submission_id,
        transaction_type: 'comment',
        app_user_id: existingComment.app_user_id,
        transaction_subtype: 'update',
        user_comment_id: existingComment.user_comment_id,
        details: { previousValue: existingComment.comment_text, newValue: commentText }
      };
      await models.submissionTransaction.create(transactionData, client);

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

  async get(commentId) {
    const sql = `SELECT c.*, u.kerberos FROM
    ${config.db.tables.userComment} c
    LEFT JOIN ${config.db.tables.user} u ON c.app_user_id = u.app_user_id
    WHERE c.user_comment_id=$1`;
    const values = [commentId];
    const r = await pgClient.query(sql, values);
    if ( r.error ) {
      return r;
    }
    return { res: r.res?.rows?.[0] };
  }
}

export default new Comment();
