import type { IRequestValidationError, TValidationErrorHandler } from 'fastest-express-validator';
import type { CheckerFunctionError } from 'fastest-validator';
import { isValidObjectId } from 'mongoose';
import type { TypedResponse } from '../types';

export const objectIdValidator = {
	error: (value: string, errors: CheckerFunctionError[]): string => {
		if (!isValidObjectId(value)) {
			errors.push({ type: 'objectId', expected: 'objectId', actual: value });
		}
		return value;
	},
	message: {
		objectId: 'The id must be an objectId',
	},
};

export const validationErrorHandler: TValidationErrorHandler = (
	err: IRequestValidationError,
	req,
	res: TypedResponse,
) => {
	res.status(400).json({
		message: 'payload/parameter validation error',
		data: err,
		status: 400,
	});
};
