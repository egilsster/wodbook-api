import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { MyWodUtils } from '../utils/my.wod.utils';

export type WorkoutScoreType = mongoose.Document & {
	workoutId: mongoose.Schema.Types.ObjectId;
	workoutTitle: string; // Sometimes the score is added to a nonexisting workout
	description: string;
	score: string;
	rx: boolean;
	measurement: string;
	notes: string;
	createdBy: mongoose.Schema.Types.ObjectId;
	createdAt: Date;
	modifiedAt: Date;
};

export class WorkoutScoreModel extends BaseModel {
	private static NAME = 'WorkoutScore';
	private static DEFINITION = {
		'workoutId': {
			'type': mongoose.Schema.Types.ObjectId,
			'ref': 'Workout'
		},
		'workoutTitle': {
			'type': String,
			'required': true,
			'trim': true
		},
		'description': {
			'type': String,
			'required': false
		},
		'score': {
			'type': String,
			'required': true
		},
		'rx': {
			'type': Boolean,
			'default': false
		},
		'measurement': {
			'type': String,
			'required': true,
			'enum': Object.values(MyWodUtils.WORKOUT_MEASUREMENTS_MAP)
		},
		'notes': {
			'type': String,
			'required': false
		},
		'createdBy': {
			'type': mongoose.Schema.Types.ObjectId,
			'ref': 'User'
		}
	};

	constructor(options: any = {}) {
		super(WorkoutScoreModel.NAME, WorkoutScoreModel.DEFINITION, options);
	}
}
