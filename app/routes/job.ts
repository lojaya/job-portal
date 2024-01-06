import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as jobApplyAction from '../usecases/job.apply';
import * as jobCreateAction from '../usecases/job.create';
import * as jobDeleteAction from '../usecases/job.delete';
import * as jobGetAction from '../usecases/job.get';
import * as jobListAction from '../usecases/job.list';
import * as jobUpdateAction from '../usecases/job.update';
import { ADMIN_ROLE, USER_ROLE } from '../utils/constant';

const router = express.Router();

// List all jobs with filters
router.get(
	'/',
	authenticate({ allowAnonymous: true }),
	jobListAction.validator,
	jobListAction.handler,
);

// Get a job detail by ID
router.get('/:id', authenticate(), jobGetAction.validator, jobGetAction.handler);

// Create a new job
router.post(
	'/',
	authenticate({ role: [ADMIN_ROLE] }),
	jobCreateAction.validator,
	jobCreateAction.handler,
);

// Apply to a job
router.post(
	'/:id/apply',
	authenticate({ role: [USER_ROLE] }),
	jobApplyAction.validator,
	jobApplyAction.handler,
);

// Update a job by ID
router.patch(
	'/:id',
	authenticate({ role: [ADMIN_ROLE] }),
	jobUpdateAction.validator,
	jobUpdateAction.handler,
);

// Delete a job by ID
router.delete(
	'/:id',
	authenticate({ role: [ADMIN_ROLE] }),
	jobDeleteAction.validator,
	jobDeleteAction.handler,
);

export = router;
