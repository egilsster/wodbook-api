import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { DateUtils } from '../utils/date.utils';

const genders = ['female', 'male', 'other'];

export type UserType = mongoose.Document & {
	email: string;
	password: string;
	admin: boolean;
	firstName: string;
	lastName: string;
	gender: string;
	dateOfBirth: Date;
	height: number;
	weight: number;
	boxName: string;
};

export class UserModel extends BaseModel {
	private static NAME = 'User';
	private static DEFINITION = {
		'email': {
			'type': String,
			'lowercase': true,
			'required': true,
			'trim': true,
			'unique': true
			// 'validate': [validateFunc, 'Invalid email']
		},
		'password': {
			'type': String,
			'required': true,
			'trim': true
		},
		'admin': {
			'type': Boolean,
			'default': false
		},
		'firstName': {
			'type': String,
			'required': false,
			'trim': true
		},
		'lastName': {
			'type': String,
			'required': false,
			'trim': true
		},
		'gender': {
			'type': String,
			'required': false,
			'enum': genders
		},
		'dateOfBirth': {
			'type': Date,
			'required': false,
			'set': DateUtils.parseDate
		},
		'height': {
			'type': Number,
			'required': false
		},
		'weight': {
			'type': Number,
			'required': false
		},
		'boxName': {
			'type': String,
			'required': false,
			'trim': true
		}
	};

	constructor(public options: any = {}) {
		super(UserModel.NAME, UserModel.DEFINITION);
	}
}
