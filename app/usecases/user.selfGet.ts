import { pick } from 'lodash';
import { userRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';

export const handler = async (req: TypedRequest, res: TypedResponse): Promise<void> => {
	try {
		const userId = req.user.sub;
		const user = await userRepository.findOne({ _id: userId });
		if (user) {
			res.status(200).json({
				message: 'success get profile info!',
				status: res.statusCode,
				data: pick(user.toJSON(), ['id', 'firstName', 'lastName', 'email', 'role']),
			});
		} else {
			res.status(404).json({
				status: res.statusCode,
				message: 'Failed to get profile info, data not found!',
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
