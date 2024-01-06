import { RequestValidator } from 'fastest-express-validator';
import type { RuleString, ValidationSchema } from 'fastest-validator';
import { jobRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';
import { objectIdValidator, validationErrorHandler } from '../utils/validator';

type IRequestParams = {
	id: string;
};

const validationSchema = {
	params: <ValidationSchema>{
		id: <RuleString>{
			label: 'Job ID',
			type: 'string',
			custom: objectIdValidator.error,
		},
	},
};

export const validator = RequestValidator(validationSchema, validationErrorHandler, {
	messages: {
		...objectIdValidator.message,
	},
});

export const handler = async (
	req: TypedRequest<IRequestParams>,
	res: TypedResponse,
): Promise<void> => {
	try {
		const jobId = req.params.id;
		const job = await jobRepository.deleteOneSoft(jobId);
		if (job) {
			res.status(200).json({
				message: 'job is deleted sucessfully!',
				status: res.statusCode,
			});
		} else {
			res.status(404).json({
				status: res.statusCode,
				message: 'Failed to remove job, data is not found!',
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
