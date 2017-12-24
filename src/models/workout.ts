import * as mongoose from 'mongoose';
import { BaseModel } from './base';

export type WorkoutType = mongoose.Document & {
	name: string;
	scores: string[];
	type: string;
	added: Date;
};

export class WorkoutModel extends BaseModel {
	private static NAME = 'Workout';
	private static DEFINITION = {
		'name': {
			'type': String,
			'required': true,
			'index': true,
			'unique': true
		},
		'scores': {
			'type': Array,
			'required': false,
			'default': []
		},
		'type': {
			'type': String,
			'required': true
		}
	};

	constructor(public options: any = {}) {
		super(WorkoutModel.NAME, WorkoutModel.DEFINITION);
	}
}
