import logger from '../../../lib/utils/logger.js';
import handleError from '../utils/handleError.js';
import textUtils from '../../../lib/utils/textUtils.js';
import models from '../../../lib/models/index.js';
import validateRecaptcha from '../utils/recaptcha.js';
import { validate, schema } from '../utils/validate/index.js';
import pgClient from '../../../lib/utils/pgClient.js';
import protect from '../utils/protect.js';


export default (app) => {

  /**
   * @description Creates a new OAF application submission
   */
  app.post('/submit', validateRecaptcha, validate(schema.submission), async (req, res) => {
    try {
      const data = {};
      for ( const key in req.validated ) {
        data[textUtils.camelToSnakeCase(key)] = req.validated[key];
      }
      data.submission_status_id = 'submitted';
      logger.info('Submission data validated', {corkTraceId: req.corkTraceId});
      const result = await models.submission.create(data);
      if (result.error) {
        throw result.error;
      }
      logger.info('Submission created', {submissionId: result.res.submissionId, corkTraceId: req.corkTraceId});
      return res.status(200).json({ submissionId: result.res.submissionId });
    } catch(e){
      return handleError(res, req, e);
    }
  });

  /**
   * @description List submission statuses
   */
  app.get('/submission-status', protect(), validate(schema.submissionStatusQuery), async (req, res) => {
    try {
      const result = await models.submissionStatus.list(req.validated);
      if ( result.error ) {
        throw result.error;
      }

      // convert keys to camelCase
      const statuses = result.res.rows.map(r => {
        let out = {};
        for ( const key in r ) {
          out[textUtils.toCamelCase(key)] = r[key];
        }
        return out;
      });

      return res.status(200).json(statuses);

    } catch(e){
      return handleError(res, req, e);
    }
  });

  app.get('/submission-status/count', protect(), async (req, res) => {
    try {
      const result = await models.submission.getCountByStatus();
      if ( result.error ) {
        throw result.error;
      }

      const counts = result.res.rows.map(r => {
        let out = {};
        for ( const key in r ) {
          out[textUtils.toCamelCase(key)] = r[key];
        }
        return out;
      });

      return res.status(200).json(counts);

    } catch(e){
      return handleError(res, req, e);
    }
  });

  app.get('/submission/query', protect(), validate(schema.submissionQuery), async (req, res) => {
    try {
      const result = await models.submission.query(req.validated);
      if ( result.error ) {
        throw result.error;
      }

      return res.status(200).json(result.res);
    } catch(e){
      return handleError(res, req, e);
    }
  });

  app.get('/submission/:id', protect(), validate(schema.submissionGet), async (req, res) => {
    try {
      const result = await models.submission.get(req.validated.id);
      if ( result.error ) {
        throw result.error;
      }
      if ( !result.res ) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      return res.status(200).json(result.res);
    } catch(e){
      return handleError(res, req, e);
    }
  });

  app.post('/submission/:id/status', protect('hasWriteAccess'), validate(schema.statusUpdate), async (req, res) => {
    let client
    try {
      client = await pgClient.pool.connect();
      await client.query('BEGIN');

      const submissionId = req.validated.id;

      // update status
      await models.submission.updateStatus(
        submissionId,
        req.validated.status,
        req.auth.token.dbUpsertObject,
        req.validated.comment,
        client
      );

      // update relevant non-status submission properties, if provided
      let status = await models.submissionStatus.getByNameOrId(req.validated.status);
      if ( status.error ) {
        throw status.error;
      }
      status = status.res;
      const submissionUpdateData = {};
      if ( req.validated.awardAmount && ['completed', 'accounting'].includes(status.name) ) {
        submissionUpdateData.award_amount = req.validated.awardAmount;
      }
      if ( req.validated.accountingSystemNumber && status.name === 'completed' ) {
        submissionUpdateData.accounting_system_number = req.validated.accountingSystemNumber;
      }
      if ( Object.keys(submissionUpdateData).length ) {
        await models.submission.update(submissionId, submissionUpdateData, req.auth.token.dbUpsertObject, client);
      }

      // TODO: send email, if not disabled

      await client.query('COMMIT');

      return res.status(200).json({ message: 'Not implemented' });
    } catch(e){
      await client.query('ROLLBACK');
      return handleError(res, req, e);
    } finally {
      client.release();
    }
  });
};
