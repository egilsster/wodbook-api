import * as mongoose from 'mongoose';
import { UserModel, UserType } from '../models/user';

export class UserService {
	private userModel: mongoose.Model<UserType>;

	constructor(private options: any = {}) {
		this.userModel = this.options.userModel || new UserModel().createModel();
	}

	async getUsers() {
		return this.userModel.find();
	}

	async getUser(user: UserType) {
		return this.userModel.findOne({ 'email': user.email });
	}
}
