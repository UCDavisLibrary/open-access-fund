import pgClient from '../utils/pgClient.js';
import config from '../utils/config.js';

class UserComment {

  async create(data, client){
    const excludeFields = ['user_comment_id'];
    const d = pgClient.prepareObjectForInsert(data, { excludeFields });
    const sql = `INSERT INTO ${config.db.tables.userComment} (${d.keysString}) VALUES (${d.placeholdersString}) RETURNING user_comment_id`;

    // part of transaction
    if ( client ) {
      const result = await client.query(sql, d.values);
      const userCommentId = result.rows[0].user_comment_id;
      return userCommentId;

    // standalone
    } else {
      const result = await pgClient.query(sql, d.values);
      if ( result.error ) return result;
      const userCommentId = result.res.rows[0].user_comment_id;
      return { res: { userCommentId } };
    }
  }
}

export default new UserComment();
