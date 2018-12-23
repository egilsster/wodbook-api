import * as mongoose from 'mongoose';
import { BaseModel } from './base';
import { MyWodUtils } from '../utils/my.wod.utils';

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
	avatarUrl: string;
	createdAt: Date;
	modifiedAt: Date;
};

export class UserModel extends BaseModel {
	private static NAME = 'User';
	private static DEFINITION = {
		email: {
			type: String,
			lowercase: true,
			required: true,
			trim: true,
			unique: true
			// 'validate': [validateFunc, 'Invalid email']
		},
		password: {
			type: String,
			required: true,
			trim: true
		},
		admin: {
			type: Boolean,
			default: false
		},
		firstName: {
			type: String,
			required: false,
			trim: true
		},
		lastName: {
			type: String,
			required: false,
			trim: true
		},
		gender: {
			type: String,
			required: false,
			enum: genders,
			set: MyWodUtils.mapGender
		},
		dateOfBirth: {
			type: Date,
			required: false,
			set: MyWodUtils.mapDate
		},
		height: {
			type: Number,
			required: false
		},
		weight: {
			type: Number,
			required: false
		},
		boxName: {
			type: String,
			required: false,
			trim: true
		},
		avatarUrl: {
			type: String,
			required: false
		}
	};

	constructor(options: any = {}) {
		super(UserModel.NAME, UserModel.DEFINITION, options);
	}
}
