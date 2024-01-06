import type { Express } from 'express';
import express from 'express';
import { BASE_ASSET_PATH } from './app.config';
import { setupFileUpload } from './middlewares/fileupload';
import { setupLogging } from './middlewares/logging';
import { setupRoutes } from './routes';

const app: Express = express();

app.use(`/${BASE_ASSET_PATH}`, express.static(BASE_ASSET_PATH));
app.use(express.json());
setupFileUpload(app);
setupLogging(app);
setupRoutes(app);

export { app };
