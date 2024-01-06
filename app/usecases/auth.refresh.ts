import type { ParamsDictionary } from 'express-serve-static-core';
import { RequestValidator } from 'fastest-express-validator';
import type { RuleString, ValidationSchema } from 'fastest-validator';
import { decodeJwt } from 'jose';
import { pick } from 'lodash';
import { signJwt } from '../middlewares/auth';
import { sessionRepository, userRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';
import { sha512digest } from '../utils/security';
import { validationErrorHandler } from '../utils/validator';

type IBodyParams = {
	refreshToken: string;
};

const validationSchema = {
	body: <ValidationSchema>{
		refreshToken: <RuleString>{
			label: 'Refresh Token',
			required: true,
			type: 'string',
			max: 512,
		},
	},
};

export const validator = RequestValidator(validationSchema, validationErrorHandler);

export const handler = async (
	req: TypedRequest<ParamsDictionary, never, IBodyParams>,
	res: TypedResponse,
): Promise<void> => {
	const { refreshToken } = req.body;
	const session = await sessionRepository.findOne({ refreshToken });

	if (session) {
		if (req.user.sub !== String(session.userId)) {
			res.status(400).json({
				status: res.statusCode,
				message: "access token doesn't match with the given refresh token!",
			});
			return;
		}
		const user = await userRepository.findOne({ _id: String(session.userId) });
		if (user) {
			try {
				const jwtPayload = pick(user, ['role', 'fullName']);
				const token = await signJwt(user.id, jwtPayload);
				const { exp: expiresIn } = decodeJwt(token);
				await sessionRepository.deleteOne(session.id);

				const newSession = await sessionRepository.createOne({
					userId: user.id,
					refreshToken: sha512digest(),
					expiresIn,
					requestHeaders: {
						ip: req.ip,
						userAgent: req.headers['user-agent'],
					},
				});

				res.status(200).json({
					message: 'access token successfully renewed!',
					status: res.statusCode,
					data: {
						token,
						expiresIn,
						refresh: newSession.toJSON().refreshToken,
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
			res.status(400).json({
				status: res.statusCode,
				message: 'user for this session is not found',
			});
		}
	} else {
		res.status(400).json({
			status: res.statusCode,
			message: 'refresh token is not found or already expired',
		});
	}
};
