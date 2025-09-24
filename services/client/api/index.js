import express from 'express';
import { iconApiMiddleware } from '@ucd-lib/cork-icon';

import auth from './routes/auth.js';
import comment from './routes/comment.js';
import configRoutes from './routes/configRoutes.js';
import submission from './routes/submission.js';

import config from '../../lib/utils/config.js';
import protect from './utils/protect.js';

const router = express.Router();

const iconsets = [
  {
    name: 'fontawesome-6.7-solid',
    aliases: ['fas'],
    preload: [
      'check', 'xmark', 'plug-circle-exclamation', 'book', 'user',
      'pen-to-square', 'envelope', 'phone', 'money-bill', 'building-columns',
      'comments', 'spinner', 'circle-check', 'circle-xmark', 'circle-question'
    ]
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
  comment(router);
  configRoutes(router);
  submission(router);
  router.use('/icon', protect(), iconApiMiddleware({iconsets}));

  app.use(`/${config.api.root.value}`, router);
}
