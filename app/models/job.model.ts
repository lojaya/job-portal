import mongoose from 'mongoose';
import db from '../db';

const schema = new mongoose.Schema(
	{
		title: {
			required: true,
			type: String,
			trim: true,
		},
		description: {
			required: true,
			type: String,
			trim: true,
		},
		company: {
			required: true,
			type: String,
		},
		salary: {
			required: false,
			type: Object,
		},
		images: {
			required: false,
			type: Array,
		},
		isActive: {
			required: true,
			type: Boolean,
			default: true,
		},
		applicants: [
			{
				applicant: {
					type: mongoose.Types.ObjectId,
					ref: 'User',
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{ versionKey: false, timestamps: true },
);

const JobModel = db.model('Job', schema, 'jobs');

export default JobModel;
