import type { Express } from 'express';
import auth from './auth';
import file from './file';
import job from './job';
import swagger from './swagger';
import user from './user';

export const setupRoutes = (app: Express): void => {
	app.use('/api/auth', auth);
	app.use('/api/users', user);
	app.use('/api/jobs', job);
	app.use('/api/file', file);
	app.use('/swagger', swagger);
};
