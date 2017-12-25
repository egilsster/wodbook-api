import * as mongoose from 'mongoose';
import { BaseModel } from './base';

export type UserType = mongoose.Document & {
	email: string;
	password: string;
	admin: boolean;
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
		}
	};

	constructor(public options: any = {}) {
		super(UserModel.NAME, UserModel.DEFINITION);
	}
}
