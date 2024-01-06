import { RequestValidator } from 'fastest-express-validator';
import type { RuleString, ValidationSchema } from 'fastest-validator';
import { omit } from 'lodash';
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
		const userId = req.user.sub;
		const jobId = req.params.id;
		const job = await jobRepository.findOne({ _id: jobId });
		if (job) {
			const applicantCount = job?.applicants.length || 0;
			const isApplied = job?.applicants.some((data) => String(data.applicant) === userId);
			res.status(200).json({
				message: 'success get job info!',
				status: res.statusCode,
				data: {
					...omit(job.toJSON(), ['deletedAt', 'applicants']),
					isApplied,
					applicantCount,
				},
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
