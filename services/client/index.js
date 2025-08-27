import express from 'express';
import setUpStaticRoutes from './static.js';
import config from '../lib/utils/config.js';

const app = express();
app.use(express.json());

setUpStaticRoutes(app);

app.listen(config.adminApp.ports.container.value, () => {
  console.log(`Admin application is running on container port ${config.adminApp.ports.container.value}`);
});
