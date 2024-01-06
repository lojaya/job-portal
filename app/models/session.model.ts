import mongoose from 'mongoose';
import { JWT_REFRESH_EXPIRES_IN } from '../app.config';
import db from '../db';

const schema = new mongoose.Schema(
	{
		userId: {
			required: true,
			type: mongoose.Types.ObjectId,
		},
		refreshToken: {
			required: true,
			type: String,
			unique: true,
		},
		expiresIn: {
			type: Number,
		},
		requestHeaders: Object,
		createdAt: {
			type: Date,
			default: Date.now,
			expires: JWT_REFRESH_EXPIRES_IN,
		},
	},
	{ versionKey: false },
);

const SessionModel = db.model('Session', schema, 'sessions');

export default SessionModel;
