import { sessionRepository, userRepository } from '../repositories';
import type { TypedRequest, TypedResponse } from '../types';

export const handler = async (req: TypedRequest, res: TypedResponse): Promise<void> => {
	try {
		const userId = req.user.sub;
		const user = await userRepository.deleteOne(userId);
		if (user) {
			await sessionRepository.deleteMany({ userId });
			res.status(200).json({
				message: 'success destroying your account!',
				status: res.statusCode,
			});
		} else {
			res.status(404).json({
				status: res.statusCode,
				message: 'Failed to remove your account, data not found!',
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
