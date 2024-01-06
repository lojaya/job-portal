import { RequestValidator } from 'fastest-express-validator';
import type { RuleBoolean, RuleNumber, RuleString, ValidationSchema } from 'fastest-validator';
import { isEmpty, isUndefined, omit } from 'lodash';
import { jobRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';
import { ADMIN_ROLE } from '../utils/constant';
import { validationErrorHandler } from '../utils/validator';

type IQueryParams = {
	page?: number;
	pageSize: number;
	orderBy?: string;
	orderAsc?: boolean;
	applied?: boolean;
	status?: string;
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
		applied: <RuleBoolean>{
			type: 'boolean',
			optional: true,
			convert: true,
		},
		status: <RuleString>{
			type: 'string',
			optional: true,
			enum: ['active', 'inactive', 'archived'],
		},
		search: <RuleString>{
			type: 'string',
			optional: true,
			lowercase: true,
			min: 3,
		},
	},
};

const createFilter = ({
	search,
	status,
	applied,
	userId,
}: {
	search?: string;
	status?: string;
	applied?: boolean;
	userId: string;
	// eslint-disable-next-line
}): any => {
	// eslint-disable-next-line
	const filterQuery: any = {};

	if (!isEmpty(search)) {
		filterQuery.$or = [
			{ title: { $regex: search, $options: 'i' } },
			{ description: { $regex: search, $options: 'i' } },
			{ company: { $regex: search, $options: 'i' } },
		];
	}

	if (!isEmpty(status) && status === 'archived') {
		filterQuery.$and = [{ deletedAt: { $ne: null } }];
	} else {
		filterQuery.$and = [{ deletedAt: null }];
		if (!isEmpty(status)) {
			if (status === 'active') {
				filterQuery.$and.push({ isActive: true });
			} else if (status === 'inactive') {
				filterQuery.$and.push({ isActive: false });
			}
		}
	}

	if (!isUndefined(applied)) {
		if (isEmpty(filterQuery.$and)) {
			filterQuery.$and = [];
		}
		filterQuery.$and.push({
			'applicants.applicant': applied ? userId : { $ne: userId },
		});
	}

	return filterQuery;
};

export const validator = RequestValidator(validationSchema, validationErrorHandler);

export const handler = async (req: TypedRequest, res: TypedResponse): Promise<void> => {
	const { page, pageSize, orderBy, orderAsc, applied, status, search } = (<unknown>(
		req.query
	)) as IQueryParams;

	if (status === 'archived' && req?.user?.role !== ADMIN_ROLE) {
		res.status(403).json({
			status: res.statusCode,
			message: 'Forbidden Access',
		});
		return;
	}

	if (!isUndefined(applied) && isEmpty(req.user)) {
		res.status(403).json({
			status: res.statusCode,
			message: 'Please login to see your applied jobs!',
		});
		return;
	}

	try {
		const userId = req?.user?.sub;

		const filterQuery = createFilter({
			search,
			status,
			applied,
			userId,
		});

		const result = await jobRepository.paginate(
			{
				selects: ['title', 'company', 'salary', 'isActive', 'createdAt', 'applicants'],
				page,
				pageSize,
				orderBy,
				orderAsc,
			},
			filterQuery,
		);
		res.status(200).json({
			message: 'success listing jobs!',
			status: res.statusCode,
			data: result.data.map((job) => ({
				...omit(job.toJSON(), 'applicants'),
				isApplied: userId
					? job?.applicants?.some((data) => String(data.applicant) === userId)
					: undefined,
			})),
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
