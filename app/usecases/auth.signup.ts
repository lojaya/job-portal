import { RequestValidator } from 'fastest-express-validator';
import type { RuleEmail, RuleString, ValidationSchema } from 'fastest-validator';
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
			min: 8,
		},
		firstName: <RuleString>{
			label: 'First Name',
			required: true,
			type: 'string',
			max: 25,
		},
		lastName: <RuleString>{
			label: 'Last Name',
			required: true,
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
	const { email, password } = req.body;
	const checkUser = await userRepository.findOne({ email });

	if (checkUser) {
		res.status(400).json({
			status: res.statusCode,
			message: `email ${email} is already registered`,
		});
		return;
	}

	const salt = generateSalt();
	const hashed = generatePassword(password, salt);

	try {
		const user = await userRepository.createOne({
			email,
			password: hashed,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
		});
		res.status(200).json({
			message: 'success registering user!',
			status: res.statusCode,
			data: {
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
			},
		});
	} catch (error) {
		res.status(400).json({
			status: res.statusCode,
			message: error.message,
			data: error,
		});
	}
};
