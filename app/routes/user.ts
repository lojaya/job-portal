import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as userListAction from '../usecases/user.list';
import * as userSelfDestructAction from '../usecases/user.selfDestruct';
import * as userSelfGetAction from '../usecases/user.selfGet';
import * as userSelfUpdateAction from '../usecases/user.selfUpdate';
import { ADMIN_ROLE } from '../utils/constant';

const router = express.Router();

// List all users
router.get(
	'/',
	authenticate({ role: [ADMIN_ROLE] }),
	userListAction.validator,
	userListAction.handler,
);

// Get self profile
router.get('/self', authenticate(), userSelfGetAction.handler);

// Update self data
router.patch('/self', authenticate(), userSelfUpdateAction.validator, userSelfUpdateAction.handler);

// Remove self data (self destruct)
router.delete('/self', authenticate(), userSelfDestructAction.handler);

export default router;
