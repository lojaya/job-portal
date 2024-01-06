import { RequestValidator } from 'fastest-express-validator';
import type { RuleBoolean, RuleNumber, RuleString, ValidationSchema } from 'fastest-validator';
import { userRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';
import { validationErrorHandler } from '../utils/validator';

type IQueryParams = {
	page?: number;
	pageSize: number;
	orderBy?: string;
	orderAsc?: boolean;
	search?: string;
};

const validationSchema = {
	query: <ValidationSchema>{
		page: <RuleNumber>{
			type: 'number',
			optional: true,
			default: 1,
			convert: true,
			integer: true,
			positive: true,
		},
		pageSize: <RuleNumber>{
			type: 'number',
			optional: true,
			default: 10,
			convert: true,
			integer: true,
			positive: true,
		},
		orderBy: <RuleString>{
			type: 'string',
			optional: true,
			default: 'createdAt',
		},
		orderAsc: <RuleBoolean>{
			type: 'boolean',
			optional: true,
			default: false,
			convert: true,
		},
		search: <RuleString>{
			type: 'string',
			optional: true,
			lowercase: true,
			min: 3,
		},
	},
};

export const validator = RequestValidator(validationSchema, validationErrorHandler);

export const handler = async (req: TypedRequest, res: TypedResponse): Promise<void> => {
	const { page, pageSize, orderBy, orderAsc, search } = (<unknown>req.query) as IQueryParams;

	try {
		const searchQuery = {
			$or: [
				{ email: { $regex: search, $options: 'i' } },
				{ firstName: { $regex: search, $options: 'i' } },
				{ lastName: { $regex: search, $options: 'i' } },
			],
		};
		const result = await userRepository.paginate(
			{
				selects: ['id', 'email', 'role', 'firstName', 'lastName', 'createdAt', 'updatedAt'],
				page,
				pageSize,
				orderBy,
				orderAsc,
			},
			search ? searchQuery : {},
		);
		res.status(200).json({
			message: 'success listing users!',
			status: res.statusCode,
			data: result.data,
			meta: {
				page,
				count: result.total,
				pages: Math.ceil(result.total / pageSize),
				pageSize,
				orderBy,
				orderAsc,
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
