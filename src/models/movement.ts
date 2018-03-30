import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { MyWodUtils } from '../utils/my.wod.utils';

export type MovementType = mongoose.Document & {
	name: string;
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
		'measurement': {
			'type': String,
			'required': true,
			'enum': MyWodUtils.MOVEMENT_MEASUREMENTS
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
