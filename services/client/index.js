import express from 'express';
import {logReqMiddleware} from '@ucd-lib/logger';
import cors from 'cors';

import setUpStaticRoutes from './static.js';
import config from '../lib/utils/config.js';
import setUpApiRoutes from './api/index.js';
import logger from '../lib/utils/logger.js';


const app = express();
app.use(logReqMiddleware(logger));
app.use(cors());
app.use(express.json());

setUpApiRoutes(app);
setUpStaticRoutes(app);

app.listen(config.adminApp.ports.container.value, () => {
  logger.info(`Admin application is running on container port ${config.adminApp.ports.container.value}`);
});
