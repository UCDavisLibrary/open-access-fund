import path from 'path';
import spaMiddleware from '@ucd-lib/spa-router-middleware';
import { fileURLToPath } from 'url';
import loaderHtml from './html/loader.html.js';
import config from '../lib/utils/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (app) => {
  let assetsDir = path.join(__dirname, './dev/public');
  const bundle = config.adminApp.env === 'prod' ? `
    todo: add prod bundle with cork-registry version
  ` : `
    <script src='/js/dev/${config.adminApp.bundleName.value}?v=${(new Date()).toISOString()}'></script>
  `;

  spaMiddleware({
    app,
    htmlFile : path.join(__dirname, '/html/index.html'),
    isRoot : true,
    appRoutes : config.adminApp.routes.value,
    static : {
      dir : assetsDir
    },
    enable404 : false,

    getConfig : async (req, res, next) => {
      next(config.makeAppConfig());
    },

    template : (req, res, next) => {
      next({
        title: config.adminApp.title.value,
        bundle,
        loaderHtml
      });
    }
  });
};
