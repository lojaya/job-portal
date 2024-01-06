import mongoose from 'mongoose';
import db from '../db';
import { ADMIN_ROLE, USER_ROLE } from '../utils/constant';

const schema = new mongoose.Schema(
	{
		email: {
			required: true,
			type: String,
			unique: true,
		},
		password: {
			required: true,
			type: String,
		},
		firstName: {
			required: true,
			type: String,
			trim: true,
		},
		lastName: {
			required: true,
			type: String,
			trim: true,
		},
		role: {
			required: true,
			type: String,
			enum: [USER_ROLE, ADMIN_ROLE],
			default: USER_ROLE,
		},
	},
	{
		versionKey: false,
		timestamps: true,
		virtuals: {
			fullName: {
				get() {
					return `${this.firstName} ${this.lastName}`;
				},
			},
		},
	},
);

const UserModel = db.model('User', schema, 'users');

export default UserModel;
