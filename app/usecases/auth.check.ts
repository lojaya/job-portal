import { pick } from 'lodash';
import { userRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';

export const handler = async (req: TypedRequest, res: TypedResponse): Promise<void> => {
	const userId = req.user.sub;
	const user = await userRepository.findOne({ _id: String(userId) });
	if (user) {
		try {
			res.status(200).json({
				message: 'session checked!',
				status: res.statusCode,
				data: pick(user, ['id', 'fullName', 'email', 'role']),
			});
		} catch (error) {
			res.status(400).json({
				status: res.statusCode,
				message: error.message,
				data: error,
			});
		}
	} else {
		res.status(400).json({
			status: res.statusCode,
			message: 'user is not found',
		});
	}
};
