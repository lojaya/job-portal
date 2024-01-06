import { RequestValidator } from 'fastest-express-validator';
import type { RuleEmail, RuleString, ValidationSchema } from 'fastest-validator';
import { isEmpty, pick } from 'lodash';
import { userRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';
import { generatePassword, generateSalt } from '../utils/security';
import { validationErrorHandler } from '../utils/validator';

type IBodyParams = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
};

const validationSchema = {
	body: <ValidationSchema>{
		$$strict: true,
		email: <RuleEmail>{
			optional: true,
			label: 'Email Address',
			type: 'email',
			lowercase: true,
			max: 120,
		},
		password: <RuleString>{
			optional: true,
			label: 'Password',
			type: 'string',
			min: 8,
		},
		confirmPassword: <RuleString>{
			optional: true,
			label: 'Confirm Password',
			type: 'string',
			custom: (value, errors, schema, name, parent, context) => {
				if (!value && context.data.password) {
					errors.push({ type: 'required' });
				} else if (context.data.password !== value) {
					errors.push({ type: 'equalField', expected: 'password' });
				}
				return value;
			},
		},
		firstName: <RuleString>{
			optional: true,
			label: 'First Name',
			type: 'string',
			max: 25,
		},
		lastName: <RuleString>{
			optional: true,
			label: 'Last Name',
			type: 'string',
			max: 25,
		},
	},
};

export const validator = RequestValidator(validationSchema, validationErrorHandler);

export const handler = async (
	req: TypedRequest<never, never, IBodyParams>,
	res: TypedResponse,
): Promise<void> => {
	if (isEmpty(req.body)) {
		res.status(400).json({
			status: res.statusCode,
			message: 'empty request body',
		});
		return;
	}
	try {
		const { email, password } = req.body;
		const userId = req.user.sub;
		const user = await userRepository.findOne({ _id: userId });
		if (user) {
			if (email) {
				const checkUser = await userRepository.findOne({ email });
				if (checkUser && email !== user.email) {
					res.status(400).json({
						status: res.statusCode,
						message: `email ${email} is already registered`,
					});
					return;
				}
			}

			if (password) {
				const salt = generateSalt();
				req.body.password = generatePassword(password, salt);
			}

			const payload = pick(req.body, ['firstName', 'lastName', 'email', 'password']);
			const updated = await userRepository.updateOne(userId, payload);

			res.status(200).json({
				message: 'success update profile info!',
				status: res.statusCode,
				data: pick(updated?.toJSON(), ['id', 'firstName', 'lastName', 'email', 'role']),
			});
		} else {
			res.status(404).json({
				status: res.statusCode,
				message: 'Failed to get profile info, user not found!',
			});
		}
	} catch (error) {
		res.status(400).json({
			status: res.statusCode,
			message: error.message,
			data: error,
		});
	}
};
