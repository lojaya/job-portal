import type { Request, Response } from 'express';
import type { ParamsDictionary, Query, Send } from 'express-serve-static-core';

export type SuccessResponse<ResponseData = any> = {
	data: ResponseData;
	message: string;
	status: number;
	meta?: {
		[key: string]: any;
		count?: number;
		page?: number;
		pages?: number;
		pageSize?: number;
		orderBy?: string;
		orderAsc?: boolean;
	};
};

export type FailedResponse = {
	message: string;
	status: number;
};

export interface TypedRequest<S = ParamsDictionary, T = Query, U = any> extends Request {
	params: S;
	query: T;
	body: U;
	user?: any;
}

export interface TypedResponse extends Response {
	json: Send<SuccessResponse | FailedResponse, this>;
}
