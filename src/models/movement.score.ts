import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { MywodUtils } from '../utils/mywod.utils';

export type MovementScoreType = mongoose.Document & {
	movementId: mongoose.Schema.Types.ObjectId;
	score: string;
	type: string;
	sets: number;
	notes: string;
	date: Date;
	createdAt: Date;
	modifiedAt: Date;
};

export class MovementScoreModel extends BaseModel {
	private static NAME = 'MovementScore';
	private static DEFINITION = {
		'movementId': {
			'type': mongoose.Schema.Types.ObjectId,
			'ref': 'Movement'
		},
		'score': {
			'type': String,
			'required': true
		},
		'measurement': {
			'type': String,
			'required': true,
			'enum': MywodUtils.MOVEMENT_MEASUREMENTS,
			'set': MywodUtils.mapMovementMeasurement
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
		super(MovementScoreModel.NAME, MovementScoreModel.DEFINITION, options);
	}
}
