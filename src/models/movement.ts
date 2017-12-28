import * as mongoose from 'mongoose';
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

export class MovementModel {
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

	/**
	 * Create the Blob model
	 * @return {Object} Blob mongoose model
	 */
	public createModel() {
		if ((mongoose as any).models[MovementModel.NAME]) {
			return mongoose.model(MovementModel.NAME);
		}
		return mongoose.model(MovementModel.NAME, this.createSchema());
	}

	/**
	 * Setup the mongo schema.
	 * @return {mongoose.Schema} Created mongoose schema
	 */
	public createSchema(): mongoose.Schema {
		return new mongoose.Schema(MovementModel.DEFINITION, {
			'timestamps': true,
			'versionKey': false
		}).index({ 'name': 1, 'createdBy': 1 }, { 'unique': true });
	}
}
