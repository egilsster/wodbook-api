import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { MyWodUtils } from '../utils/my.wod.utils';

export type MovementScoreType = mongoose.Document & {
	score: string;
	measurement: string;
	sets: number;
	notes: string;
	date: Date;
	createdBy: mongoose.Schema.Types.ObjectId;
	createdAt: Date;
	modifiedAt: Date;
};

export class MovementScoreModel extends BaseModel {
	private static NAME = 'MovementScore';
	private static DEFINITION = {
		'score': {
			'type': String,
			'required': true
		},
		'measurement': {
			'type': String,
			'required': true,
			'enum': MyWodUtils.MOVEMENT_MEASUREMENTS,
			'set': MyWodUtils.mapMovementMeasurement
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
			'set': MyWodUtils.mapDate
		},
		'createdBy': {
			'type': mongoose.Schema.Types.ObjectId,
			'ref': 'User'
		}
	};

	constructor(options: any = {}) {
		super(MovementScoreModel.NAME, MovementScoreModel.DEFINITION, options);
	}
}
