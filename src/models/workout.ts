import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { MywodUtils } from '../utils/mywod.utils';
import { WorkoutScoreType } from './workout.score';

export type WorkoutType = mongoose.Document & {
	title: string;
	scores: WorkoutScoreType[];
	measurement: string;
	description: string;
	createdBy: mongoose.Schema.Types.ObjectId;
	createdAt: Date;
	modifiedAt: Date;
};

export class WorkoutModel extends BaseModel {
	private static NAME = 'Workout';
	private static DEFINITION = {
		'title': {
			'type': String,
			'required': true,
			'trim': true
		},
		'scores': [{
			'type': mongoose.Schema.Types.ObjectId,
			'ref': 'WorkoutScore'
		}],
		'measurement': {
			'type': String,
			'required': true,
			'enum': Object.values(MywodUtils.WORKOUT_MEASUREMENTS),
			'set': MywodUtils.mapWorkoutMeasurement
		},
		'description': {
			'type': String,
			'required': false
		},
		'createdBy': {
			'type': mongoose.Schema.Types.ObjectId,
			'ref': 'User'
		}
	};

	constructor(options: any = {}) {
		super(WorkoutModel.NAME, WorkoutModel.DEFINITION, { ...options, indices: { 'title': 1, 'createdBy': 1 }, unique: { 'unique': true } });
	}
}
