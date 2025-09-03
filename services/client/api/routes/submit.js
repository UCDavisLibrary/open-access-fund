import config from '../../../lib/utils/config.js';
import logger from '../../../lib/utils/logger.js';
import handleError from '../utils/handleError.js';

import validateRecaptcha from '../utils/recaptcha.js';
import { validate, submissionSchema } from '../utils/validation.js';


export default (app) => {
  app.post('/submit', validateRecaptcha, validate(submissionSchema), async (req, res) => {
    try {

      const data = req.validated;
      console.log('data', data);

      return res.status(200).json({message: 'Validation passed'});


    } catch(e){
      return handleError(res, req, e);
    }
  });
};
