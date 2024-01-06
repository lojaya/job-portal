import fs from 'fs';
import path from 'path';
import type { Express } from 'express';
import morgan from 'morgan';

const accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' });

export const setupLogging = (app: Express): void => {
	app.use(morgan('combined', { stream: accessLogStream }));
};
