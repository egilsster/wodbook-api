import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { MywodUtils } from '../utils/mywod.utils';
import { MovementScoreType } from './movement.score';

export type MovementType = mongoose.Document & {
	name: string;
	scores: MovementScoreType[];
	measurement: string;
	createdBy: mongoose.Schema.Types.ObjectId;
	createdAt: Date;
	modifiedAt: Date;
};

export class MovementModel extends BaseModel {
	private static NAME = 'Movement';
	private static DEFINITION = {
		'name': {
			'type': String,
			'required': true,
			'trim': true
		},
		'scores': [{
			'type': mongoose.Schema.Types.ObjectId,
			'ref': 'MovementScore'
		}],
		'measurement': {
			'type': String,
			'required': true,
			'enum': MywodUtils.MOVEMENT_MEASUREMENTS,
			'set': MywodUtils.mapMovementMeasurement
		},
		'createdBy': {
			'type': mongoose.Schema.Types.ObjectId,
			'ref': 'User'
		}
	};

	constructor(options: any = {}) {
		super(MovementModel.NAME, MovementModel.DEFINITION, { ...options, indices: { 'name': 1, 'createdBy': 1 }, unique: { 'unique': true } });
	}
}
