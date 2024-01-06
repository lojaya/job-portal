import type { NextFunction } from 'express';
import { decodeJwt, jwtVerify, SignJWT } from 'jose';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../app.config';
import type { TypedRequest, TypedResponse } from '../types';
import { ADMIN_ROLE, USER_ROLE } from '../utils/constant';

const jwtSecret = new TextEncoder().encode(JWT_SECRET);

export const signJwt = async (userId: string, payload: Record<string, unknown>): Promise<string> =>
	new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setSubject(userId)
		.setExpirationTime(JWT_EXPIRES_IN)
		.sign(jwtSecret);

export const authenticate =
	(options?: { allowAnonymous?: boolean; shouldVerify?: boolean; role?: string[] }) =>
	async (req: TypedRequest, res: TypedResponse, next: NextFunction): Promise<void> => {
		const opts = {
			allowAnonymous: false,
			shouldVerify: true,
			role: [USER_ROLE, ADMIN_ROLE],
			...options,
		};

		const token = req.headers.authorization?.split(' ')[1];

		if (!token && !opts.allowAnonymous) {
			res.status(401).json({
				status: res.statusCode,
				message: 'Missing authentication header',
			});
			return;
		}

		if (token) {
			let payload: { role?: string } = {};
			try {
				payload = decodeJwt(token);
			} catch (error) {
				res.status(400).json({
					status: res.statusCode,
					message: error.message,
					data: error,
				});
				return;
			}

			const isAuthorized = opts.role.includes(<string>payload.role);

			try {
				await jwtVerify(token, jwtSecret);
			} catch (error) {
				if (error.code === 'ERR_JWT_EXPIRED' && !opts.shouldVerify && isAuthorized) {
					req.user = payload;
					next();
					return;
				}
				res.status(401).json({
					status: res.statusCode,
					message: error.message,
					data: error,
				});
				return;
			}

			if (!isAuthorized) {
				res.status(403).json({
					status: res.statusCode,
					message: 'Forbidden access',
				});
				return;
			}

			req.user = payload;
			next();
			return;
		}

		if (opts.allowAnonymous) {
			next();
		}
	};
