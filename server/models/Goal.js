const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		frequency: {
			type: String,
			required: true,
			trim: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);
