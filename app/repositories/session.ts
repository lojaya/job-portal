/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { SessionModel } from '../models';

export default function makeSessionRepo({ session }: { session: typeof SessionModel }) {
	function findOne(params: typeof SessionModel.schema.obj | { _id: string }) {
		const query = session.findOne(params);
		return query.exec();
	}

	function deleteOne(_id: string) {
		const query = session.findOneAndDelete({ _id });
		return query.exec();
	}

	function deleteMany(filter: { [key: string]: string }) {
		const query = session.deleteMany(filter);
		return query.exec();
	}

	function createOne(data: typeof SessionModel.schema.obj) {
		return new SessionModel(data).save();
	}

	return { findOne, deleteOne, deleteMany, createOne };
}
