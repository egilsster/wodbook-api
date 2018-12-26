import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import { AuthService } from '../../src/services/auth';
import { UserDao } from '../../src/dao/user';
import { User } from '../../src/models/user';

describe('AuthService', () => {
	let service: AuthService;
	let _service: sinon.SinonMock;
	let userDao: UserDao, _userDao: sinon.SinonMock;

	const user = new User({
		id: 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7',
		email: 'some@email.com',
		password: 'pass',
		admin: false
	});

	beforeEach(() => {
		const anyOptions: any = {};
		userDao = new UserDao(anyOptions);
		_userDao = sinon.mock(userDao);

		const options = {
			userDao
		};

		service = new AuthService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_userDao.verify();
		_service.verify();
	});

	describe('signup', () => {
		it('should signup a user successfully', async () => {
			_userDao.expects('createUser').resolves(user);
			await expect(service.signup(user)).resolves.toEqual(user);
		});
	});

	describe('login', () => {
		it('should successfully login if user exists', async () => {
			_userDao.expects('getUserByEmail').withArgs(user.email).resolves(user);
			await expect(service.login(user)).resolves.toEqual(user);
		});

		it('should throw unauthorized exception if user does not exist', async () => {
			_userDao.expects('getUserByEmail').resolves();
			await expect(service.login(user)).rejects.toHaveProperty('status', HttpStatus.UNAUTHORIZED);
		});

		it('should throw unauthorized exception if user exists but password does not match', async () => {
			_userDao.expects('getUserByEmail').resolves({ email: user.email, password: 'anotherPassword' });
			await expect(service.login(user)).rejects.toHaveProperty('status', HttpStatus.UNAUTHORIZED);
		});
	});
});
