import * as Koa from 'koa';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Server } from 'http';
import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { WorkoutRouter } from '../../src/routes/workout';
import { WorkoutService } from '../../src/services/workout';
import { Workout } from '../../src/models/workout';
import { WorkoutScore } from '../../src/models/workout.score';

describe('Workout Router', () => {
	let request: supertest.SuperTest<supertest.Test>;
	let server: Server;
	let workoutRouter: WorkoutRouter, _router: sinon.SinonMock;
	let workoutService: WorkoutService, _workoutService: sinon.SinonMock;
	const userId = 'KkZogjZCwjq6IzE1QAQmrXaKTTMuUp4D';
	const claims: any = { userId: userId };
	const workoutId = '1';
	let ctx;
	const workout = new Workout({
		id: 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7',
		name: 'Fran',
		measurement: 'time',
		userId
	});
	const workoutScore = new WorkoutScore({
		workoutId: workout.id,
		measurement: workout.measurement,
		score: '1:59'
	});

	beforeEach(() => {
		ctx = {
			request: {
				body: workout.toObject()
			},
			params: {
				id: workout.id
			},
			query: {},
			state: { claims }
		};

		workoutService = new WorkoutService({ policyService: {} });
		_workoutService = sinon.mock(workoutService);

		workoutRouter = new WorkoutRouter({
			workoutService
		});
		_router = sinon.mock(workoutRouter);

		const app = new Koa();
		workoutRouter.init(app);
		server = app.listen();
		request = supertest(server);
	});

	afterEach(() => {
		server.close();
		_workoutService.verify();
		_router.verify();
	});

	describe('constructor', () => {
		it('should create new instance of service', () => {
			const instance = new WorkoutRouter({});
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
			const workoutRouter = new WorkoutRouter({ workoutService: {} });
			workoutRouter.init(app);

			expect(appUseSpy.calledOnce).toBe(true);
		});
	});

	describe('getWorkouts', () => {
		it('should handle GET /v1/workouts', async () => {
			workoutRouter.getWorkouts = async (ctx) => { ctx.status = HttpStatus.OK; };
			await request.get('/v1/workouts').expect(HttpStatus.OK);
		});

		it('should return 200 OK when no resources exist', async () => {
			_workoutService.expects('getWorkouts').withExactArgs(claims).resolves([]);

			await workoutRouter.getWorkouts(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
		});

		it('should return 200 OK with array of resources', async () => {
			_workoutService.expects('getWorkouts').withExactArgs(claims).resolves([workout]);

			await workoutRouter.getWorkouts(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
			expect(ctx.body).toEqual({
				data: [workout.toObject()]
			});
		});
	});

	describe('getWorkout', () => {
		it('should handle GET /v1/workouts/:id', async () => {
			workoutRouter.getWorkout = async (ctx) => { ctx.status = HttpStatus.OK; };
			await request.get('/v1/workouts/1').expect(HttpStatus.OK);
		});

		it('should return workout and scores when workout with id is found', async () => {
			_workoutService.expects('getWorkoutById').withExactArgs(workoutId, claims).resolves(workout);
			_workoutService.expects('getScores').withExactArgs(workoutId, claims).resolves([workoutScore]);

			ctx.params.id = workoutId;
			await workoutRouter.getWorkout(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
			expect(ctx.body).toEqual({
				...workout.toObject(),
				scores: [workoutScore.toObject()]
			});
		});
	});

	describe('createWorkout', () => {
		it('should handle POST /v1/workouts', async () => {
			workoutRouter.createWorkout = async (ctx) => { ctx.status = HttpStatus.CREATED; };
			await request.post('/v1/workouts').expect(HttpStatus.CREATED);
		});

		it('should return 201 CREATED when creating a workout', async () => {
			_workoutService.expects('createWorkout').withExactArgs(ctx.request.body, claims).resolves(workout);

			await workoutRouter.createWorkout(ctx);

			expect(ctx.status).toEqual(HttpStatus.CREATED);
			expect(ctx.body).toEqual(workout.toObject());
		});
	});

	describe('addScore', () => {
		it('should handle POST /v1/workouts/:id', async () => {
			workoutRouter.addScore = async (ctx) => { ctx.status = HttpStatus.CREATED; };
			await request.post('/v1/workouts/:id').expect(HttpStatus.CREATED);
		});

		it('should save score for workout', async () => {
			_.set(ctx, 'request.body', workoutScore.toObject());

			_workoutService.expects('addScore').withExactArgs(workout.id, workoutScore.toObject(), claims).resolves(workoutScore);

			await workoutRouter.addScore(ctx);

			expect(ctx.status).toEqual(HttpStatus.CREATED);
			expect(ctx.body).toEqual(workoutScore.toObject());
		});
	});
});
