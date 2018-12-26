import { UserDao } from '../dao/user';
import { ServiceError } from '../utils/service.error';
import { ERROR_TEMPLATES } from '../utils/error.templates';
import { User } from '../models/user';

export class AuthService {
	private userDao: UserDao;

	constructor(options: any) {
		this.userDao = options.userDao;
	}

	async signup(user: User) {
		return this.userDao.createUser(user);
	}

	async login(user: User) {
		const { email, password } = user;
		const data = await this.userDao.getUserByEmail(email);

		if (!data) {
			throw new ServiceError(ERROR_TEMPLATES.UNAUTHORIZED, { meta: { message: 'Email not registered' } });
		}

		if (data.password !== password) {
			throw new ServiceError(ERROR_TEMPLATES.UNAUTHORIZED, { meta: { message: 'Password is incorrect' } });
		}

		return data;
	}
}
