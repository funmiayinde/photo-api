import BaseSchema from "../../core/api/base.model";
import validations from './photo.validation';
import mongoose from "mongoose";

const PhotoModel = new BaseSchema({
	sol: {
		type: Number,
		default: 0,
	},
	camera: {
		id: Number,
		name: String,
		rover_id: String,
		full_name: String,
	},
	img_src: {
		type: String,
	},
	earth_date: {
		type: String,
	},
	rover: {
		id: Number,
		name: String,
		landing_date: String,
		launch_date: String,
		status: String,
	},
	deleted: {
		type: Boolean,
		select: false,
		default: false,
	}
}, {
	timestamps: true
});

PhotoModel.statics.validations = (type, body) => {
	return validations[type](body);
};

/**
 * @typedef PhotoModel
 * */
export const Photo = mongoose.model('Photo', PhotoModel);
