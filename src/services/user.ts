import { UserDao } from '../dao/user';
import { User } from '../models/user';

export class UserService {
	private userDao: UserDao;

	constructor(options: any) {
		this.userDao = options.userDao;
	}

	async getUsers(claims: Claims) {
		return this.userDao.getUsers(claims);
	}

	async getUserByEmail(email: string) {
		return this.userDao.getUserByEmail(email);
	}

	async getUserById(userId: string) {
		return this.userDao.getUserById(userId);
	}

	async updateUserByEmail(user: User, claims: Claims) {
		return this.userDao.updateUserByEmail(user, claims);
	}
}
