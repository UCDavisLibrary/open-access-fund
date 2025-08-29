import express from 'express';
import config from '../../lib/utils/config.js';
import configRoutes from './configRoutes.js';
import submit from './submit.js';

const router = express.Router();

export default (app) => {
  configRoutes(app);
  submit(app);
  app.use(config.api.root.value, router);
}
