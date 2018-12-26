import * as Koa from 'koa';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Server } from 'http';
import * as HttpStatus from 'http-status-codes';
import * as fs from 'fs-extra';
import * as _ from 'lodash';
import { MyWodRouter } from '../../src/routes/my.wod';
import { MyWodService } from '../../src/services/my.wod';
import { User } from '../../src/models/user';
import { Movement } from '../../src/models/movement';
import { Workout } from '../../src/models/workout';

describe('MyWod Router', () => {
	let request: supertest.SuperTest<supertest.Test>;
	let server: Server;
	let myWodRouter: MyWodRouter, _router: sinon.SinonMock;
	let myWodService: MyWodService, _myWodService: sinon.SinonMock;
	let _fs: sinon.SinonMock;
	let ctx: Koa.Context;

	const claims: any = { userId: 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7' };
	const file = { path: 'path' };

	beforeEach(() => {
		ctx = {
			request: {
				files: {
					file
				}
			},
			state: { claims } as any
		} as any;

		myWodService = new MyWodService({ policyService: {} });
		_myWodService = sinon.mock(myWodService);

		_fs = sinon.mock(fs);

		myWodRouter = new MyWodRouter({
			myWodService
		});
		_router = sinon.mock(myWodRouter);

		const app = new Koa();
		myWodRouter.init(app);
		server = app.listen();
		request = supertest(server);
	});

	afterEach(() => {
		server.close();
		_myWodService.verify();
		_router.verify();
		_fs.verify();
	});

	describe('constructor', () => {
		it('should create new instance of service', () => {
			const instance = new MyWodRouter({});
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
			const myWodRouter = new MyWodRouter({ myWodService: {} });
			myWodRouter.init(app);

			expect(appUseSpy.calledOnce).toBe(true);
		});
	});

	describe('migrate', () => {
		it('should handle GET /v1/mywod/migrate', async () => {
			myWodRouter.migrate = async (ctx) => { ctx.status = HttpStatus.OK; };
			await request.post('/v1/mywod/migrate').expect(HttpStatus.OK);
		});

		it('should return 200 OK if migration is successful', async () => {
			const user = new User({
				id: 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7',
				email: 'test@email.com',
				password: 'test',
				admin: false,
			});
			const movement = new Movement({
				id: '5L129VaYljbRepTqO7zI39oRHvgeYWK6',
				name: 'HSPU',
				measurement: 'reps',
				userId: user.id
			});
			const workout = new Workout({
				id: '5L129VaYljbRepTqO7zI39oRHvgeYWK6',
				name: 'Fran',
				measurement: 'time',
				userId: user.id
			});

			const contents = {
				athlete: 'athlete',
				workouts: 'workouts',
				movements: 'movements',
				movementScores: 'movementScores',
				workoutScores: 'workoutScores'
			};

			_myWodService.expects('readContentsFromDatabase').withExactArgs(file.path).resolves(contents);
			_myWodService.expects('saveAthlete').withExactArgs(contents.athlete, claims).resolves(user);
			_myWodService.expects('saveWorkouts').withExactArgs(contents.workouts, claims).resolves([workout]);
			_myWodService.expects('saveMovementsAndMovementScores').withExactArgs(contents.movements, contents.movementScores, claims).resolves([movement]);
			_myWodService.expects('saveWorkoutScores').withExactArgs(contents.workoutScores, claims).resolves();
			_fs.expects('unlinkSync').withExactArgs(file.path).returns(undefined);

			await myWodRouter.migrate(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
			expect(ctx.body).toEqual({
				user: user.toObject(),
				workouts: [workout.toObject()],
				movements: [movement.toObject()]
			});
		});

		it('should throw an error if the migration fails', async () => {
			const err = new Error();
			_myWodService.expects('readContentsFromDatabase').withExactArgs(file.path).rejects(err);
			_fs.expects('unlinkSync').withExactArgs(file.path).returns(undefined);

			await expect(myWodRouter.migrate(ctx)).rejects.toEqual(err);
		});

		it('should throw an error if file is missing from request', async () => {
			_.set(ctx, 'request.files.file', null);
			await expect(myWodRouter.migrate(ctx)).rejects.toHaveProperty('status', HttpStatus.BAD_REQUEST);
		});
	});
});
