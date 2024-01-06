import type { Express } from 'express';
import fileUpload from 'express-fileupload';

const MEGABYTES = 1024 * 1024;
const config = {
	limits: { fileSize: 2 * MEGABYTES },
	// useTempFiles: true,
	// tempFileDir: '/tmp/',
	abortOnLimit: true,
};

export const setupFileUpload = (app: Express): void => {
	app.use(fileUpload(config));
};
