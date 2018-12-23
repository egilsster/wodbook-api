import * as supertest from 'supertest';
import * as sinon from 'sinon';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import { UserService } from '../../src/services/user';
import { UserRouter } from '../../src/routes/user';

describe('User endpoint', () => {
	const user = {
		id: 'userId',
		email: 'user@email.com'
	};
	let request: supertest.SuperTest<supertest.Test>;
	let userRouter: UserRouter;
	let userMongo;
	let userService: UserService;
	let _userService: sinon.SinonMock;
	let app: express.Application;

	beforeEach(() => {
		userService = new UserService();
		_userService = sinon.mock(userService);

		userMongo = {
			_id: '5a47b3ae8c4a33b2fdf118a9',
			updatedAt: '2017-12-30 15:41:46.850',
			createdAt: '2017-12-30 15:41:34.006',
			email: 'test@email.com',
			password: 'test',
			admin: false,
			boxName: 'CrossFit Cloud',
			dateOfBirth: '1969-06-09 00:00:00.000',
			firstName: 'Cloud',
			gender: 'male',
			height: 199,
			lastName: 'Atlas',
			weight: 90000
		};

		const logger = {
			debug() { },
			info() { },
			warn() { },
			error() { }
		};

		userRouter = new UserRouter({
			userService,
			logger
		});
		userRouter.initRoutes();
		app = express();
		app.use((req, _res, next) => {
			req['user'] = user;
			next();
		});
		app.use('/', userRouter.router);
		request = supertest(app);
	});

	afterEach(() => {
		_userService.verify();
	});

	it('should create instance of router when no options are given', () => {
		const router = new UserRouter();
		expect(router).toBeDefined();
	});

	describe('GET /me', () => {
		it('should get 200 OK when user on the request exists', async (done) => {
			_userService.expects('getUser').resolves(userMongo);

			try {
				const res = await request.get('/me');
				expect(res.status).toEqual(HttpStatus.OK);
				expect(res.body.data).toBeDefined();
				const user = res.body.data;
				expect(user).toHaveProperty('boxName');
				expect(user).toHaveProperty('dateOfBirth');
				expect(user).toHaveProperty('email');
				expect(user).toHaveProperty('firstName');
				expect(user).toHaveProperty('lastName');
				expect(user).toHaveProperty('gender');
				expect(user).toHaveProperty('height');
				expect(user).toHaveProperty('weight');
				expect(user).toHaveProperty('createdAt');
				expect(user).toHaveProperty('updatedAt');
				expect(Object.keys(user).length).toBe(10);
				expect(user).not.toHaveProperty('_id');
				expect(user).not.toHaveProperty('id');
				expect(user).not.toHaveProperty('password');
				expect(user).not.toHaveProperty('admin');
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should get 404 Not found if user on the request does not exist', async (done) => {
			_userService.expects('getUser').resolves();

			try {
				const res = await request.get('/me');
				expect(res.status).toEqual(HttpStatus.NOT_FOUND);
				done();
			} catch (err) {
				done(err);
			}
		});
	});
});
