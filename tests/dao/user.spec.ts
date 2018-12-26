import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { UserDao } from '../../src/dao/user';
import { User } from '../../src/models/user';
import { ServiceError } from '../../src/utils/service.error';
import { ErrorUtils } from '../../src/utils/error.utils';
import { ERROR_TEMPLATES } from '../../src/utils/error.templates';

describe('UserDao', () => {
	let userDao: UserDao, _userDao: sinon.SinonMock;
	let mongo;
	let _userCollection: sinon.SinonMock;
	let _errorUtils: sinon.SinonMock;

	const dateProps = ['createdAt', 'updatedAt'];
	const user = new User({
		id: 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7',
		password: 'pass',
		email: 'some@email.com',
		admin: false
	});

	const claims: any = { userId: user.id };

	beforeEach(() => {
		mongo = {
			users: { insertOne() { }, findOne() { }, find() { }, updateOne() { } }
		};

		_userCollection = sinon.mock(mongo.users);

		userDao = new UserDao(mongo);
		_userDao = sinon.mock(userDao);

		_errorUtils = sinon.mock(ErrorUtils);
	});

	afterEach(() => {
		_userCollection.verify();
		_userDao.verify();
		_errorUtils.verify();
	});

	describe('createUser', () => {
		it('should call insertOne to create a new user', async () => {
			_userCollection.expects('insertOne').resolves({
				ops: [user.toObject()]
			});
			const createdUser = await userDao.createUser(user);

			expect(_.omit(createdUser, dateProps)).toEqual(_.omit(user, dateProps));
		});

		it('should throw error when insertOne fails', async () => {
			const serviceErr = new ServiceError(ERROR_TEMPLATES.CONFLICT);
			const err = new Error();
			_userCollection.expects('insertOne').rejects(err);
			_errorUtils.expects('convertMongoErrorToServiceError').withArgs(err).returns(serviceErr);

			await expect(userDao.createUser(user)).rejects.toEqual(expect.any(ServiceError));
		});
	});

	describe('getUsers', () => {
		it('should call find to get the users', async () => {
			const cursorRes = {
				toArray: sinon.stub().resolves([user])
			};
			_userCollection.expects('find').returns(cursorRes);

			await expect(userDao.getUsers(claims)).resolves.toEqual([user]);
		});

		it('should return empty array if no users exist', async () => {
			const cursorRes = {
				toArray: sinon.stub().resolves([])
			};
			_userCollection.expects('find').returns(cursorRes);

			await expect(userDao.getUsers(claims)).resolves.toEqual([]);
		});
	});

	describe('getUserById', () => {
		it('should call findOne to get the user', async () => {
			_userCollection.expects('findOne').resolves(user);

			await expect(userDao.getUserById(claims)).resolves.toEqual(user);
		});

		it('should throw exception with status 404 if user is not found', async () => {
			_userCollection.expects('findOne').resolves();

			await expect(userDao.getUserById(claims)).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
		});
	});

	describe('getUserByEmail', () => {
		it('should call findOne to get the user', async () => {
			_userCollection.expects('findOne').resolves(user);

			await expect(userDao.getUserByEmail(user.email)).resolves.toEqual(user);
		});

		it('should throw exception with status 404 if user is not found', async () => {
			_userCollection.expects('findOne').resolves();

			await expect(userDao.getUserByEmail(user.email)).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
		});
	});

	describe('updateUserByEmail', () => {
		it('should update user', async () => {
			_userCollection.expects('updateOne').resolves(user);

			await expect(userDao.updateUserByEmail(user, claims)).resolves.toEqual(user);
		});

		it('should throw error when updateOne errors', async () => {
			const serviceErr = new ServiceError(ERROR_TEMPLATES.CONFLICT);
			const err = new Error();
			_userCollection.expects('updateOne').rejects(err);
			_errorUtils.expects('convertMongoErrorToServiceError').withArgs(err).returns(serviceErr);

			await expect(userDao.updateUserByEmail(user, claims)).rejects.toEqual(expect.any(ServiceError));
		});
	});
});
