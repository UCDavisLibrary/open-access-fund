import config from '../../lib/utils/config.js';
import logger from '../../lib/utils/logger.js';
import handleErrors from './handleErrors.js';

import {RecaptchaEnterpriseServiceClient} from '@google-cloud/recaptcha-enterprise';
const recaptchaClient = new RecaptchaEnterpriseServiceClient();

export default (app) => {
  app.post('/submit', async (req, res) => {
    try {
      const payload = req.body;
      if ( !config.recaptcha.disabled.value ){
        if ( !payload.recaptchaToken ) {
          return res.status(401).json({error: 'recaptchaToken is required'});
        }
        const projectPath = recaptchaClient.projectPath(config.recaptcha.projectId.value);
        const request = ({
          assessment: {
            event: {
              token: payload.recaptchaToken,
              siteKey: config.recaptcha.key.value,
            },
          },
          parent: projectPath
        });

        const [ response ] = await recaptchaClient.createAssessment(request);
        if (!response.tokenProperties.valid) {
          logger.info({req, message: 'Invalid recaptcha token', details: response.tokenProperties.invalidReason});
          return res.status(401).json({error: 'Invalid recaptcha token'});
        }
        if ( response.tokenProperties.action !== config.recaptcha.submissionAction.value ) {
          logger.info({req, message: 'Recaptcha action mismatch', details: {expected: config.recaptcha.submissionAction.value, got: response.tokenProperties.action }});
          return res.status(401).json({error: 'Recaptcha action mismatch'});
        }
        if ( response.riskAnalysis.score < config.recaptcha.scoreThreshold.value ) {
          logger.info({req, message: 'Recaptcha score too low', details: response.riskAnalysis});
          return res.status(401).json({error: 'Recaptcha score too low'});
        }

        logger.info({req, message: 'Recaptcha passed', details: response.riskAnalysis});

      }
    } catch(e){
      return handleErrors(res, req, e);
    }
  });
};
