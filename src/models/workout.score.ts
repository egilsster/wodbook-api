import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { MywodUtils } from '../utils/mywod.utils';

export type WorkoutScoreType = mongoose.Document & {
	workoutId: mongoose.Schema.Types.ObjectId;
	workoutTitle: string;
	score: string;
	rx: boolean;
	type: string;
	sets: number;
	notes: string;
	date: Date;
	createdAt: Date;
	modifiedAt: Date;
};

export class WorkoutScoreModel extends BaseModel {
	private static NAME = 'WorkoutScore';
	private static DEFINITION = {
		'workoutId': {
			'type': mongoose.Schema.Types.ObjectId,
			'ref': 'Workout',
			'required': false
		},
		'workoutTitle': {
			'type': String,
			'required': true
		},
		'score': {
			'type': String,
			'required': true
		},
		'rx': {
			'type': Boolean,
			'default': false
		},
		'type': {
			'type': String,
			'required': true,
			'enum': Object.values(MywodUtils.WORKOUT_MEASUREMENTS),
			'set': MywodUtils.mapWorkoutMeasurement
		},
		'sets': {
			'type': Number,
			'default': 1,
			'set': Number
		},
		'notes': {
			'type': String,
			'required': false
		},
		'date': {
			'type': Date,
			'required': true,
			'set': MywodUtils.mapDate
		}
	};

	constructor(options: any = {}) {
		super(WorkoutScoreModel.NAME, WorkoutScoreModel.DEFINITION, options);
	}
}
