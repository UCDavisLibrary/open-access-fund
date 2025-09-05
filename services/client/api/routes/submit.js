import logger from '../../../lib/utils/logger.js';
import handleError from '../utils/handleError.js';
import textUtils from '../../../lib/utils/textUtils.js';
import models from '../../../lib/models/index.js';
import validateRecaptcha from '../utils/recaptcha.js';
import { validate, submissionSchema } from '../utils/validate/index.js';


export default (app) => {

  /**
   * @description Creates a new OAF application submission
   */
  app.post('/submit', validateRecaptcha, validate(submissionSchema), async (req, res) => {
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
};
