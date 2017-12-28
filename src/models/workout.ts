import * as mongoose from 'mongoose';
import { MywodUtils } from '../utils/mywod.utils';
import { WorkoutScoreType } from './workout.score';

export type WorkoutType = mongoose.Document & {
	title: string;
	scores: WorkoutScoreType[];
	scoreType: string;
	description: string;
	createdBy: mongoose.Schema.Types.ObjectId;
	createdAt: Date;
	modifiedAt: Date;
};

export class WorkoutModel {
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
		'scoreType': {
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

	/**
	 * Create the Blob model
	 * @return {Object} Blob mongoose model
	 */
	public createModel() {
		if ((mongoose as any).models[WorkoutModel.NAME]) {
			return mongoose.model(WorkoutModel.NAME);
		}
		return mongoose.model(WorkoutModel.NAME, this.createSchema());
	}

	/**
	 * Setup the mongo schema.
	 * @return {mongoose.Schema} Created mongoose schema
	 */
	public createSchema(): mongoose.Schema {
		return new mongoose.Schema(WorkoutModel.DEFINITION, {
			'timestamps': true,
			'versionKey': false
		}).index({ 'title': 1, 'createdBy': 1 }, { 'unique': true });
	}
}
