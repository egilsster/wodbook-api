import * as Koa from 'koa';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Server } from 'http';
import * as HttpStatus from 'http-status-codes';
import { UserRouter } from '../../src/routes/user';
import { UserService } from '../../src/services/user';
import { User } from '../../src/models/user';

describe('User Router', () => {
	let request: supertest.SuperTest<supertest.Test>;
	let server: Server;
	let userRouter: UserRouter, _router: sinon.SinonMock;
	let userService: UserService, _userService: sinon.SinonMock;
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
	const claims: any = { userId: user.id };

	beforeEach(() => {
		ctx = {
			state: { claims } as any
		} as Koa.Context;

		userService = new UserService({ policyService: {} });
		_userService = sinon.mock(userService);

		userRouter = new UserRouter({
			userService
		});
		_router = sinon.mock(userRouter);

		const app = new Koa();
		userRouter.init(app);
		server = app.listen();
		request = supertest(server);
	});

	afterEach(() => {
		server.close();
		_userService.verify();
		_router.verify();
	});

	describe('constructor', () => {
		it('should create new instance of service', () => {
			const instance = new UserRouter({});
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
			const userRouter = new UserRouter({ userService: {} });
			userRouter.init(app);

			expect(appUseSpy.calledOnce).toBe(true);
		});
	});

	describe('me', () => {
		it('should handle GET /v1/users/me', async () => {
			userRouter.me = async (ctx) => { ctx.status = HttpStatus.OK; };
			await request.get('/v1/users/me').expect(HttpStatus.OK);
		});

		it('should return 200 OK with the logged in user\'s data', async () => {
			_userService.expects('getUserById').withExactArgs(claims.userId).resolves(user);

			await userRouter.me(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
			expect(ctx.body).toEqual(user.toObject());
		});

		it('should throw an error if the user does not exist', async () => {
			const err = new Error();
			_userService.expects('getUserById').withExactArgs(claims.userId).rejects(err);

			await expect(userRouter.me(ctx)).rejects.toEqual(err);
		});
	});
});
