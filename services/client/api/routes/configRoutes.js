import config from '../../../lib/utils/config.js';

export default (app) => {
  app.get('/config/recaptcha', async (req, res) => {
    res.json({
      key: config.recaptcha.key.value,
      disabled: config.recaptcha.disabled.value,
      submissionAction: config.recaptcha.submissionAction.value
    });
  });
};
