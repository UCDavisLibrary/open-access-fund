import pgClient from '../utils/pgClient.js';
import config from '../utils/config.js';
import logger from '../utils/logger.js';

class User {

  async upsert(data={}, client){

    if ( !client ){
      throw new Error('User upsert must be part of a transaction');
    }

    let appUserId;
    let needsUpdate = false;

    const idFields = ['app_user_id', 'kerberos', 'email'];
    if ( !idFields.some(f => data[f]) ) {
      let message = 'Missing required field. One of app_user_id, kerberos, email required';
      throw new Error(message);
    }

    let whereClause = {};
    for ( const f of idFields ) {
      if ( data[f] ) {
        whereClause[f] = data[f];
      }
    }
    whereClause = pgClient.toWhereClause(whereClause, true);
    const exists = await client.query(
      `SELECT * FROM ${config.db.tables.user} WHERE ${whereClause.sql} LIMIT 1`,
      whereClause.values
    );
    if ( exists.rows?.[0]?.app_user_id ) {
      const appUser = exists.rows[0];
      for ( const field of Object.keys(data) ) {
        if ( data[field] && data[field] !== appUser[field] ){
          needsUpdate = true;
          break;
        }
      }
      appUserId = appUser.app_user_id;
    }

    if ( needsUpdate ) {
      // update
      const d = pgClient.prepareObjectForUpdate(data, { excludeFields: ['app_user_id'] });
      const sql = `UPDATE ${config.db.tables.user} SET ${d.sql} WHERE app_user_id=$${d.values.length + 1} RETURNING app_user_id`;
      const values = [...d.values, appUserId];
      logger.info('User.upsert update', {sql, values});
      const result = await client.query(sql, values);
      appUserId = result.rows[0].app_user_id;

    } else if ( !appUserId ) {
      // insert
      const d = pgClient.prepareObjectForInsert(data);
      const sql = `INSERT INTO ${config.db.tables.user} (${d.keysString}) VALUES (${d.placeholdersString}) RETURNING app_user_id`;
      logger.info('User.upsert insert', {sql, values: d.values});
      const result = await client.query(sql, d.values);
      appUserId = result.rows[0].app_user_id;
    }

    return appUserId;

  }

}

export default new User();
