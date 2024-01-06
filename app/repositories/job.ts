/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { FilterQuery, MongooseQueryOptions } from 'mongoose';
import { JobModel } from '../models';

type PaginationOptions = {
	page?: number;
	pageSize?: number;
	orderBy?: string;
	orderAsc?: boolean;
	selects?: string[];
};

export default function makeJobRepo({ job }: { job: typeof JobModel }) {
	async function paginate(options: PaginationOptions, mQuery: FilterQuery<typeof JobModel> = {}) {
		const {
			selects = [''],
			page = 1,
			pageSize = 10,
			orderBy = '_id',
			orderAsc = true,
		} = options;

		const query = job
			.find(mQuery)
			.select(selects)
			.limit(pageSize)
			.skip((page - 1) * pageSize)
			.sort({
				[orderBy]: orderAsc ? 'asc' : 'desc',
			});

		const data = await query.exec();
		const total = await job.countDocuments(mQuery);

		return { data, total };
	}

	async function findOne(
		params: typeof JobModel.schema.obj | { _id: string },
		withApplicants = false,
	) {
		const query = job.findOne({ ...params, deletedAt: null });
		if (withApplicants) {
			await query.populate('applicants.applicant');
		}
		return query.exec();
	}

	function deleteOne(_id: string) {
		const query = job.findOneAndDelete({ _id });
		return query.exec();
	}

	function deleteOneSoft(_id: string) {
		const query = job.findOneAndUpdate(
			{ _id, deletedAt: null },
			{ deletedAt: Date.now() },
			{ new: true },
		);
		return query.exec();
	}

	function createOne(data: typeof JobModel.schema.obj) {
		return new JobModel(data).save();
	}

	function updateOne(
		_id: string,
		data: typeof JobModel.schema.obj,
		opts: MongooseQueryOptions = {},
	) {
		return JobModel.findOneAndUpdate({ _id }, data, { new: true, ...opts });
	}

	return {
		paginate,
		findOne,
		deleteOne,
		deleteOneSoft,
		createOne,
		updateOne,
	};
}
