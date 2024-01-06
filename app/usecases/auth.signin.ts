import type { ParamsDictionary } from 'express-serve-static-core';
import { RequestValidator } from 'fastest-express-validator';
import type { RuleEmail, RuleString, ValidationSchema } from 'fastest-validator';
import { decodeJwt } from 'jose';
import { pick } from 'lodash';
import { signJwt } from '../middlewares/auth';
import { sessionRepository, userRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';
import { checkPassword, sha512digest } from '../utils/security';
import { validationErrorHandler } from '../utils/validator';

type IBodyParams = {
	email: string;
	password: string;
};

const validationSchema = {
	body: <ValidationSchema>{
		email: <RuleEmail>{
			label: 'Email Address',
			required: true,
			type: 'email',
			lowercase: true,
			max: 120,
		},
		password: <RuleString>{
			label: 'Password',
			required: true,
			type: 'string',
		},
	},
};

export const validator = RequestValidator(validationSchema, validationErrorHandler);

export const handler = async (
	req: TypedRequest<ParamsDictionary, never, IBodyParams>,
	res: TypedResponse,
): Promise<void> => {
	const { email, password } = req.body;
	const user = await userRepository.findOne({ email });
	if (user && checkPassword(password, user.password)) {
		try {
			const jwtPayload = pick(user, ['role', 'fullName']);
			const token = await signJwt(user.id, jwtPayload);
			const { exp: expiresIn } = decodeJwt(token);

			const session = await sessionRepository.createOne({
				userId: user.id,
				refreshToken: sha512digest(),
				expiresIn,
				requestHeaders: {
					ip: req.ip,
					userAgent: req.headers['user-agent'],
				},
			});

			res.status(200).json({
				message: 'signing in success',
				status: res.statusCode,
				data: {
					token,
					expiresIn,
					refresh: session.toJSON().refreshToken,
					user: pick(user, ['id', 'fullName', 'email', 'role']),
				},
			});
		} catch (error) {
			res.status(400).json({
				status: res.statusCode,
				message: error.message,
				data: error,
			});
		}
	} else {
		res.status(403).json({
			status: res.statusCode,
			message: 'wrong email or password',
		});
	}
};
