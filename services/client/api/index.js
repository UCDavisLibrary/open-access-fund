import express from 'express';

import auth from './routes/auth.js';
import config from '../../lib/utils/config.js';
import configRoutes from './routes/configRoutes.js';
import submit from './routes/submit.js';

const router = express.Router();

export default (app) => {

  // routes
  auth(router);
  configRoutes(router);
  submit(router);

  app.use(`/${config.api.root.value}`, router);
}
