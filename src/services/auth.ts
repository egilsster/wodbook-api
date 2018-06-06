import * as mongoose from 'mongoose';
const HttpStatus = require('http-status-codes');
import { UserModel, UserType } from '../models/user';
import { ExpressError } from '../utils/express.error';

export class AuthService {
	private userModel: mongoose.Model<UserType>;

	constructor(private options: any = {}) {
		this.userModel = this.options.userModel || new UserModel().createModel();
	}

	async register(user: UserType) {
		const model = new this.userModel(user);
		return model.save();
	}

	async login(user: UserType) {
		const { email, password } = user;
		const data = await this.userModel.findOne({ email });

		if (!data) {
			throw new ExpressError('Email not registered', HttpStatus.UNAUTHORIZED);
		}

		if (data.password !== password) {
			throw new ExpressError('Password is incorrect', HttpStatus.UNAUTHORIZED);
		}

		return data;
	}
}
