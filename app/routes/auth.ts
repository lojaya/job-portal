import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as authDestroyUsecase from '../usecases/auth.destroy';
import * as authRefreshUsecase from '../usecases/auth.refresh';
import * as signInUsecase from '../usecases/auth.signin';
import * as signUpUsecase from '../usecases/auth.signup';

const router = express.Router();

// sign up / register - create a new account
router.post('/signup', signUpUsecase.validator, signUpUsecase.handler);

// sign in / log in - logging in to the account
router.post('/signin', signInUsecase.validator, signInUsecase.handler);

// sign out / log out - loging out from the account
router.post(
	'/destroy',
	authDestroyUsecase.validator,
	authenticate({ shouldVerify: false }),
	authDestroyUsecase.handler,
);

// refresh token - renew access & refresh token
router.post(
	'/refresh',
	authRefreshUsecase.validator,
	authenticate({ shouldVerify: false }),
	authRefreshUsecase.handler,
);

export = router;
