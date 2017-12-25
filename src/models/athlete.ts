import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { DateUtils } from '../utils/date.utils';

const genders = ['female', 'male', 'other'];

export type AthleteType = mongoose.Document & {
	firstName: string;
	lastName: string;
	gender: string;
	email: string;
	dateOfBirth: Date;
	height: number;
	weight: number;
	boxName: string;
};

export class AthleteModel extends BaseModel {
	private static NAME = 'Athlete';
	private static DEFINITION = {
		'firstName': {
			'type': String,
			'required': true,
			'trim': true
		},
		'lastName': {
			'type': String,
			'required': true,
			'trim': true
		},
		'gender': {
			'type': String,
			'required': true,
			'enum': genders
		},
		'email': {
			'type': String,
			'lowercase': true,
			'required': true,
			'trim': true,
			'unique': true
		},
		'dateOfBirth': {
			'type': Date,
			'required': true,
			'set': DateUtils.parseDate
		},
		'height': {
			'type': Number,
			'required': true
		},
		'weight': {
			'type': Number,
			'required': true
		},
		'boxName': {
			'type': String,
			'required': true,
			'trim': true
		}
	};

	constructor(public options: any = {}) {
		super(AthleteModel.NAME, AthleteModel.DEFINITION);
	}
}
