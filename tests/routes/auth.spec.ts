import * as Koa from 'koa';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Server } from 'http';
import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { AuthRouter } from '../../src/routes/auth';
import { AuthService } from '../../src/services/auth';
import { User } from '../../src/models/user';
import { ConfigService } from '../../src/services/config';
import { JwtUtils } from '../../src/utils/jwt.utils';

describe('Auth Router', () => {
	let request: supertest.SuperTest<supertest.Test>;
	let server: Server;
	let authRouter: AuthRouter, _router: sinon.SinonMock;
	let authService: AuthService, _authService: sinon.SinonMock;
	let configService: ConfigService, _configService: sinon.SinonMock;
	let _jwtUtils: sinon.SinonMock;

	const token = 'jwt';
	const config = {
		jwtConfig: {
			publicKey: 'publicKey'
		}
	};
	let ctx: Koa.Context;
	const user = new User({
		id: 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7',
		email: 'test@email.com',
		password: 'test',
		admin: false,
		boxName: 'CrossFit Cloud',
		dateOfBirth: '1969-06-09 00:00:00.000',
		firstName: 'Cloud',
		height: 199,
		lastName: 'Atlas',
		weight: 90000
	});
	const claims: any = {
		userId: user.id,
		email: user.email,
		admin: user.admin
	};

	beforeEach(() => {
		ctx = {
			request: {
				body: user.toObject()
			},
			params: {
				id: user.id
			} as any,
			query: {} as any,
		} as Koa.Context;

		authService = new AuthService({ policyService: {} });
		_authService = sinon.mock(authService);

		configService = new ConfigService();
		_configService = sinon.mock(configService);

		_jwtUtils = sinon.mock(JwtUtils);

		authRouter = new AuthRouter({
			authService,
			configService
		});
		_router = sinon.mock(authRouter);

		const app = new Koa();
		authRouter.init(app);
		server = app.listen();
		request = supertest(server);
	});

	afterEach(() => {
		server.close();
		_authService.verify();
		_configService.verify();
		_router.verify();
		_jwtUtils.verify();
	});

	describe('constructor', () => {
		it('should create new instance of service', () => {
			const instance = new AuthRouter({});
			expect(instance).toBeDefined();
		});
	});

	describe('init', () => {
		it('Should initialize the app', async () => {
			const app = {
				use: function (routesMiddleware) {
					this.routesMiddleware = routesMiddleware;
				}
			} as any;
			const appUseSpy = sinon.spy(app, 'use');
			const authRouter = new AuthRouter({ authService: {} });
			authRouter.init(app);

			expect(appUseSpy.calledOnce).toBe(true);
		});
	});

	describe('login', () => {
		it('should handle POST /v1/auth/login', async () => {
			authRouter.login = async (ctx) => { ctx.status = HttpStatus.OK; };
			await request.post('/v1/auth/login').expect(HttpStatus.OK);
		});

		it('should return 200 OK when successfully logging in', async () => {
			_authService.expects('login').withExactArgs(ctx.request.body).resolves(user);
			_configService.expects('getConfig').returns(config);
			_jwtUtils.expects('signToken').withExactArgs(claims, config.jwtConfig.publicKey).returns(token);

			await authRouter.login(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
			expect(ctx.body).toHaveProperty('token');
		});
	});

	describe('signup', () => {
		it('should handle POST /v1/auth/signup', async () => {
			authRouter.signup = async (ctx) => { ctx.status = HttpStatus.CREATED; };
			await request.post('/v1/auth/signup').expect(HttpStatus.CREATED);
		});

		it('should return 201 OK when successfully signing up', async () => {
			_authService.expects('signup').withExactArgs(ctx.request.body).resolves(user);
			_configService.expects('getConfig').returns(config);
			_jwtUtils.expects('signToken').withExactArgs(claims, config.jwtConfig.publicKey).returns(token);

			await authRouter.signup(ctx);

			expect(ctx.status).toEqual(HttpStatus.CREATED);
			expect(ctx.body).toHaveProperty('token');
		});
	});
});
