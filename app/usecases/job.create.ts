import type { ParamsDictionary } from 'express-serve-static-core';
import { RequestValidator } from 'fastest-express-validator';
import type {
	RuleArray,
	RuleBoolean,
	RuleObject,
	RuleString,
	RuleURL,
	ValidationSchema,
} from 'fastest-validator';
import { omit } from 'lodash';
import { jobRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';
import { validationErrorHandler } from '../utils/validator';

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
	body: <ValidationSchema>{
		$$strict: true,
		title: <RuleString>{
			label: 'Job Title',
			required: true,
			type: 'string',
			min: 10,
			max: 120,
		},
		description: <RuleString>{
			label: 'Job Description',
			required: true,
			type: 'string',
			min: 10,
			max: 2000,
		},
		company: <RuleString>{
			label: 'Company',
			required: true,
			type: 'string',
			min: 10,
			max: 120,
		},
		salary: <RuleObject>{
			type: 'object',
			optional: true,
			default: null,
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
			default: true,
			convert: true,
		},
	},
};

export const validator = RequestValidator(validationSchema, validationErrorHandler);

export const handler = async (
	req: TypedRequest<ParamsDictionary, never, IBodyParams>,
	res: TypedResponse,
): Promise<void> => {
	const { title, description, company, salary, images, isActive } = req.body;

	try {
		const job = await jobRepository.createOne({
			title,
			description,
			company,
			salary,
			images,
			isActive,
		});

		res.status(200).json({
			message: 'job created sucessfully',
			status: res.statusCode,
			data: omit(job, ['applicants', 'deletedAt']),
		});
	} catch (error) {
		res.status(400).json({
			status: res.statusCode,
			message: error.message,
			data: error,
		});
	}
};
