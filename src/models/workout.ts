import * as mongoose from 'mongoose';

const scoreTypes = ['time', 'distance', 'load', 'repetitions', 'rounds', 'timed_rounds', 'tabata', 'total', 'none'];

export type WorkoutType = mongoose.Document & {
	title: string;
	scores: string[];
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
			'required': true
		},
		'scores': {
			'type': Array,
			'required': false,
			'default': []
		},
		'scoreType': {
			'type': String,
			'required': true,
			'enum': scoreTypes
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
