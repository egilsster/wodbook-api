import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { MyWodUtils } from '../utils/my.wod.utils';

export type WorkoutType = mongoose.Document & {
	title: string;
	measurement: string;
	description: string;
	global: boolean;
	createdBy: mongoose.Schema.Types.ObjectId;
	createdAt: Date;
	modifiedAt: Date;
};

export class WorkoutModel extends BaseModel {
	private static NAME = 'Workout';
	private static DEFINITION = {
		title: {
			type: String,
			required: true,
			trim: true
		},
		measurement: {
			type: String,
			required: true,
			enum: Object.values(MyWodUtils.WORKOUT_MEASUREMENTS)
		},
		description: {
			type: String,
			required: false
		},
		global: {
			type: Boolean,
			default: false
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	};

	constructor(options: any = {}) {
		super(WorkoutModel.NAME, WorkoutModel.DEFINITION, { ...options, indices: { title: 1, createdBy: 1 }, unique: { unique: true } });
	}
}
