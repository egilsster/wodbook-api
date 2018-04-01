import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { MyWodUtils } from '../utils/my.wod.utils';

export type WorkoutScoreType = mongoose.Document & {
	workoutId: mongoose.Schema.Types.ObjectId;
	score: string;
	rx: boolean;
	measurement: string;
	notes: string;
	createdBy: string;
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
			'enum': Object.values(MyWodUtils.WORKOUT_MEASUREMENTS)
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
