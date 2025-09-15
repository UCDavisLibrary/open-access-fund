import express from 'express';
import { iconApiMiddleware } from '@ucd-lib/cork-icon';

import auth from './routes/auth.js';
import config from '../../lib/utils/config.js';
import configRoutes from './routes/configRoutes.js';
import submit from './routes/submit.js';

const router = express.Router();

const iconsets = [
  {
    name: 'fontawesome-6.7-solid',
    aliases: ['fas'],
    preload: ['check', 'xmark', 'plug-circle-exclamation']
  },
  { name: 'fontawesome-6.7-regular', aliases: ['far']},
  {
    name: 'ucdlib-core',
    aliases: ['ucdlib'],
    preload: ['ucdlib-logo']
  }
];

export default (app) => {

  // routes
  auth(router);
  configRoutes(router);
  submit(router);
  router.use('/icon', iconApiMiddleware({iconsets}));

  app.use(`/${config.api.root.value}`, router);
}
