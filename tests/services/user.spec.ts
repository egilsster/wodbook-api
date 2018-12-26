import * as sinon from 'sinon';

import { UserService } from '../../src/services/user';
import { User } from '../../src/models/user';
import { UserDao } from '../../src/dao/user';

describe('UserService', () => {
	let service: UserService;
	let _service: sinon.SinonMock;
	let userDao: UserDao, _userDao: sinon.SinonMock;

	const user = new User({
		id: 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7',
		email: 'some@email.com',
		password: 'pass',
		admin: false
	});
	const claims: any = { userId: user.id };

	beforeEach(() => {
		const anyOptions: any = {};
		userDao = new UserDao(anyOptions);
		_userDao = sinon.mock(userDao);

		const options = {
			userDao
		};

		service = new UserService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_userDao.verify();
		_service.verify();
	});

	describe('getUsers', () => {
		it('should return list of workouts', async () => {
			const items = ['user1', 'user2'];
			_userDao.expects('getUsers').withExactArgs(claims).resolves(items);

			await expect(service.getUsers(claims)).resolves.toEqual(items);
		});
	});

	describe('getUserByEmail', () => {
		it('should get user with specified email', async () => {
			_userDao.expects('getUserByEmail').withExactArgs(user.email).resolves(user);

			await expect(service.getUserByEmail(user.email)).resolves.toEqual(user);
		});
	});

	describe('getUserById', () => {
		it('should get user with specified id', async () => {
			_userDao.expects('getUserById').withExactArgs(user.id).resolves(user);

			await expect(service.getUserById(user.id)).resolves.toEqual(user);
		});
	});

	describe('updateUserByEmail', () => {
		it('should update user with specified email', async () => {
			_userDao.expects('updateUserByEmail').withExactArgs(user, claims).resolves(user);

			await expect(service.updateUserByEmail(user, claims)).resolves.toEqual(user);
		});
	});
});
