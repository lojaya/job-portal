import { RequestValidator } from 'fastest-express-validator';
import type {
	RuleArray,
	RuleBoolean,
	RuleObject,
	RuleString,
	RuleURL,
	ValidationSchema,
} from 'fastest-validator';
import { isEmpty, omit, pick } from 'lodash';
import { jobRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';
import { objectIdValidator, validationErrorHandler } from '../utils/validator';

type IRequestParams = {
	id: string;
};

type IBodyParams = {
	title: string;
	description: string;
	company: string;
	salary: {
		currency: string;
		type: string;
		value: string;
	};
	images: string[];
	isActive: boolean;
};

const validationSchema = {
	params: <ValidationSchema>{
		id: <RuleString>{
			label: 'Job ID',
			type: 'string',
			custom: objectIdValidator.error,
		},
	},
	body: <ValidationSchema>{
		$$strict: true,
		title: <RuleString>{
			label: 'Job Title',
			optional: true,
			type: 'string',
			min: 10,
			max: 120,
		},
		description: <RuleString>{
			label: 'Job Description',
			optional: true,
			type: 'string',
			min: 10,
			max: 2000,
		},
		company: <RuleString>{
			label: 'Company',
			optional: true,
			type: 'string',
			min: 10,
			max: 120,
		},
		salary: <RuleObject>{
			type: 'object',
			optional: true,
			properties: {
				currency: <RuleString>{
					label: 'Salary Currency',
					required: true,
					type: 'string',
					length: 3,
				},
				type: <RuleString>{
					label: 'Salary Type',
					required: true,
					type: 'string',
					enum: ['ranged', 'fixed', 'equity'],
				},
				value: <RuleString>{
					label: 'Company',
					required: true,
					type: 'string',
					convert: true,
					singleLine: true,
					trim: true,
					min: 1,
					max: 10,
				},
			},
		},
		images: <RuleArray>{
			label: 'Images',
			type: 'array',
			optional: true,
			items: <RuleObject>{
				type: 'object',
				optional: true,
				properties: {
					title: <RuleString>{
						label: 'Image Title',
						optional: true,
						type: 'string',
						default: '',
						singleLine: true,
						trim: true,
						max: 120,
					},
					url: <RuleURL>{
						label: 'Image URL',
						required: true,
						type: 'url',
					},
				},
			},
		},
		isActive: <RuleBoolean>{
			label: 'Active Status',
			optional: true,
			type: 'boolean',
			convert: true,
		},
	},
};

export const validator = RequestValidator(validationSchema, validationErrorHandler, {
	messages: {
		...objectIdValidator.message,
	},
});

export const handler = async (
	req: TypedRequest<IRequestParams, never, IBodyParams>,
	res: TypedResponse,
): Promise<void> => {
	const { id: jobId } = req.params;
	if (isEmpty(req.body)) {
		res.status(400).json({
			status: res.statusCode,
			message: 'empty request body',
		});
		return;
	}
	try {
		const job = await jobRepository.findOne({ _id: jobId });
		if (job) {
			const payload = pick(req.body, [
				'title',
				'description',
				'company',
				'salary',
				'images',
				'isActive',
			]);

			const updated = await jobRepository.updateOne(jobId, payload);

			res.status(200).json({
				message: 'success update job info!',
				status: res.statusCode,
				data: omit(updated, ['applicants', 'deletedAt']),
			});
		} else {
			res.status(404).json({
				status: res.statusCode,
				message: 'Failed to get job info, data not found!',
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
