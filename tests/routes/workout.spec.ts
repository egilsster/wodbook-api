import * as supertest from 'supertest';
import * as sinon from 'sinon';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import WorkoutRouter from '../../src/routes/workout';
import { WorkoutService } from '../../src/services/workout';
import { ExpressError } from '../../src/utils/express.error';
import RouterUtils from '../../src/utils/router.utils';

describe('Workout endpoint', () => {
	const user = {
		'id': 'userId',
		'email': 'user@email.com'
	};
	let request: supertest.SuperTest<supertest.Test>;
	let workoutRouter: WorkoutRouter;
	let workoutMongo;
	let workoutService: WorkoutService;
	let _workoutService: sinon.SinonMock;
	let app: express.Application;

	beforeEach(() => {
		workoutService = new WorkoutService();
		_workoutService = sinon.mock(workoutService);

		workoutMongo = {
			'id': '5a4704ca46425f97c638bcaa',
			'name': 'Fran'
		};

		const logger = {
			debug() { },
			info() { },
			warn() { },
			error() { }
		};

		workoutRouter = new WorkoutRouter({
			workoutService,
			logger
		});
		workoutRouter.initRoutes();

		app = express();
		app.use((req, res, next) => {
			req['user'] = user;
			next();
		});
		app.use('/', workoutRouter.router);
		app.use(RouterUtils.errorHandler);
		request = supertest(app);
	});

	afterEach(() => {
		_workoutService.restore();
	});

	function verifyAll() {
		_workoutService.verify();
	}

	it('should create instance of router when no options are given', () => {
		const router = new WorkoutRouter();
		expect(router).toBeDefined();
	});

	describe('GET /workouts query parameters', () => {
		it('200 GET /workouts without query parameters returns a list of workouts', (done) => {
			_workoutService.expects('getWorkouts').returns([workoutMongo]);
			request.get('/')
				.expect(HttpStatus.OK)
				.end((err, res) => {
					done(err);
					expect(res.body.data).toBeDefined();
					expect(res.body.data).toEqual([workoutMongo]);
					verifyAll();
					done();
				});
		});
	});

	describe('GET /workouts/{id}', () => {
		it('200 Get specific workout.', (done) => {
			_workoutService.expects('getWorkout').withArgs(user.id, workoutMongo.id).resolves(workoutMongo);

			request.get(`/${workoutMongo.id}`)
				.expect(HttpStatus.OK)
				.end((err, res) => {
					done(err);
					expect(res.body).toBeDefined();
					expect(res.body.data).toEqual(workoutMongo);
					verifyAll();
					done();
				});
		});

		it('404 The specified workout does not exist', (done) => {
			_workoutService.expects('getWorkout').withArgs(user.id, workoutMongo.id).resolves(null);
			request.get(`/${workoutMongo.id}`)
				.expect(HttpStatus.NOT_FOUND)
				.end((err, res) => {
					done(err);
					verifyAll();
					done();
				});
		});
	});

	describe('POST /workouts', () => {
		let createWorkoutPostBody;

		beforeEach(() => {
			createWorkoutPostBody = {
				'data': {
					'createdBy': user.id,
					'name': 'wodBook',
					'scores': [
						'TBD'
					],
					'type': 'bull'
				}
			};
		});

		it('415 Content-type is not JSON', (done) => {
			request.post('/')
				.send('This is a string')
				.expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
				.end((err, res) => {
					done(err);
					verifyAll();
					done();
				});
		});

		it('201 Successful workout creation', async (done) => {
			_workoutService.expects('createWorkout').withArgs(createWorkoutPostBody.data).returns(workoutMongo);

			try {
				const res = await request.post('/')
					.send(createWorkoutPostBody);
				expect(res.status).toBe(HttpStatus.CREATED);
				expect(res.body.data).toEqual(workoutMongo);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 500 if workout could not be created', async (done) => {
			_workoutService.expects('createWorkout').withArgs(createWorkoutPostBody.data).rejects();

			try {
				const res = await request.post('/')
					.send(createWorkoutPostBody);
				expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('GET /workouts/{id}/scores', () => {
		const scores = ['score1', 'score2'];

		it('should return 200 with a non-empty list of scores for a workout if it has scores registered', async (done) => {
			_workoutService.expects('getWorkoutScores').withExactArgs(user.id, workoutMongo.id).resolves(scores);

			try {
				const res = await request.get(`/${workoutMongo.id}/scores`);
				expect(res.status).toBe(HttpStatus.OK);
				expect(res.body).toHaveProperty('data', scores);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 200 with an empty list of scores for a workout if it has no scores', async (done) => {
			_workoutService.expects('getWorkoutScores').withExactArgs(user.id, workoutMongo.id).resolves([]);

			try {
				const res = await request.get(`/${workoutMongo.id}/scores`);
				expect(res.status).toBe(HttpStatus.OK);
				expect(res.body).toHaveProperty('data', []);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 404 if the specified workout does not exist', async (done) => {
			const err = new ExpressError(`Entity with identity '${workoutMongo.id}' does not exist`, HttpStatus.NOT_FOUND);
			_workoutService.expects('getWorkoutScores').withExactArgs(user.id, workoutMongo.id).throws(err);

			try {
				const res = await request.get(`/${workoutMongo.id}/scores`);
				expect(res.status).toBe(HttpStatus.NOT_FOUND);
				expect(res.body).toHaveProperty('status', err.status);
				expect(res.body).toHaveProperty('detail', err.detail);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('POST /workouts/{id}/scores', () => {
		const score = { 'workoutId': 'workoutId' };

		it('should return 201 if score is successfully added to workout', async (done) => {
			_workoutService.expects('addScore').withExactArgs(user.id, workoutMongo.id, score).resolves(score);

			try {
				const res = await request.post(`/${workoutMongo.id}/scores`).send({ 'data': score });
				expect(res.status).toBe(HttpStatus.CREATED);
				expect(res.body).toHaveProperty('data', score);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 404 if the specified workout does not exist', async (done) => {
			const err = new ExpressError(`Entity with identity '${workoutMongo.id}' does not exist`, HttpStatus.NOT_FOUND);
			_workoutService.expects('addScore').withExactArgs(user.id, workoutMongo.id, score).rejects(err);

			try {
				const res = await request.post(`/${workoutMongo.id}/scores`).send({ 'data': score });
				expect(res.status).toBe(HttpStatus.NOT_FOUND);
				expect(res.body).toHaveProperty('status', err.status);
				expect(res.body).toHaveProperty('detail', err.detail);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});
	});
});
