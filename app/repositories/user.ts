/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { FilterQuery, MongooseQueryOptions } from 'mongoose';
import { UserModel } from '../models';

type PaginationOptions = {
	page?: number;
	pageSize?: number;
	orderBy?: string;
	orderAsc?: boolean;
	selects?: string[];
};

export default function makeUserRepo({ user }: { user: typeof UserModel }) {
	async function paginate(
		options: PaginationOptions,
		mQuery: FilterQuery<typeof UserModel> = {},
	) {
		const {
			selects = [''],
			page = 1,
			pageSize = 10,
			orderBy = '_id',
			orderAsc = true,
		} = options;

		const query = user
			.find(mQuery)
			.select(selects)
			.limit(pageSize)
			.skip((page - 1) * pageSize)
			.sort({
				[orderBy]: orderAsc ? 'asc' : 'desc',
			});

		const data = await query.exec();
		const total = await user.countDocuments(mQuery);

		return { data, total };
	}

	function findOne(params: typeof UserModel.schema.obj | { _id: string }, selects = ['']) {
		const query = user.findOne(params).select(selects);
		return query.exec();
	}

	function deleteOne(_id: string) {
		const query = user.findOneAndDelete({ _id });
		return query.exec();
	}

	function createOne(data: typeof UserModel.schema.obj) {
		return new UserModel(data).save();
	}

	function updateOne(
		_id: string,
		data: typeof UserModel.schema.obj,
		opts: MongooseQueryOptions = {},
	) {
		return UserModel.findOneAndUpdate({ _id }, data, { new: true, ...opts });
	}

	return { paginate, findOne, deleteOne, createOne, updateOne };
}
