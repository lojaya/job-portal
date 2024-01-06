import { RequestValidator } from 'fastest-express-validator';
import type { RuleString, ValidationSchema } from 'fastest-validator';
import { sessionRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';
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
		},
	},
};

export const validator = RequestValidator(validationSchema, validationErrorHandler);

export const handler = async (
	req: TypedRequest<never, never, IBodyParams>,
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
		await sessionRepository.deleteOne(session.id);
		res.status(200).json({
			status: res.statusCode,
			message: `session successfully destroyed`,
		});
	} else {
		res.status(400).json({
			status: res.statusCode,
			message: 'refresh token is not found or already expired',
		});
	}
};
