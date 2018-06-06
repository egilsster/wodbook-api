import * as supertest from 'supertest';
import * as sinon from 'sinon';
import * as express from 'express';
const HttpStatus = require('http-status-codes');
import * as jwt from 'jsonwebtoken';

import { AuthService } from '../../src/services/auth';
import { AuthRouter } from '../../src/routes/auth';
import { JwtUtils } from '../../src/utils/jwt.utils';

describe('Auth endpoint', function () {
	const user = {
		'id': 'userId',
		'email': 'user@email.com'
	};
	let request: supertest.SuperTest<supertest.Test>;
	let authRouter: AuthRouter;
	let userMongo;
	let authService: AuthService;
	let _authService: sinon.SinonMock;
	let app: express.Application;
	let token: string;

	beforeAll(function () {
		authService = new AuthService();
		_authService = sinon.mock(authService);

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
		const cert = 'publicKey';
		authRouter = new AuthRouter({
			authService,
			logger
		});
		authRouter.initRoutes();
		token = jwt.sign(user, cert);
		app = express();
		app.use((req, res, next) => {
			req['token'] = token;
			next();
		});
		app.use('/', authRouter.router);
		request = supertest(app);
	});

	afterEach(() => {
		_authService.restore();
	});

	function verifyAll() {
		_authService.verify();
	}

	it('should create instance of router when no options are given', () => {
		const router = new AuthRouter();
		expect(router).toBeDefined();
	});

	describe('POST /login', () => {
		const payload = {
			data: {
				email: 'some@user.com',
				password: 'test'
			}
		};

		it('should get 200 OK with a JWT if credentials match an existing user', async (done) => {
			_authService.expects('login').resolves(userMongo);

			try {
				const res = await request.post('/login').send(payload);
				expect(res.status).toEqual(HttpStatus.OK);
				expect(res.body).toBeDefined();
				expect(res.body.data).toBeDefined();
				expect(res.body.data).toHaveProperty('token');
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('POST /register', () => {
		const payload = {
			data: {
				email: 'some@user.com',
				password: 'test',
				admin: true
			}
		};

		it('should get 201 Created if user is registered successfully', async (done) => {
			_authService.expects('register').resolves(userMongo);

			try {
				const res = await request.post('/register').send(payload);
				expect(res.status).toEqual(HttpStatus.CREATED);
				expect(res.body).toBeDefined();
				expect(res.body.data).toBeDefined();
				expect(res.body.data).toHaveProperty('token');
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});
	});
});
