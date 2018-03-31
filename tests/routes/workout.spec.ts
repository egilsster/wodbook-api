import * as supertest from 'supertest';
import * as sinon from 'sinon';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import WorkoutRouter from '../../src/routes/workout';
import { WorkoutService } from '../../src/services/workout';
import ExpressError from '../../src/utils/express.error';

describe('workout endpoint', function () {
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

	beforeEach(function () {
		workoutService = new WorkoutService();
		_workoutService = sinon.mock(workoutService);

		workoutMongo = {
			'id': '5a4704ca46425f97c638bcaa',
			'name': 'spliff',
			'scores': [
				'TBD'
			],
			'type': 'TBD'
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
		request = supertest(app);
	});

	afterEach(function () {
		_workoutService.restore();
	});

	function verifyAll() {
		_workoutService.verify();
	}

	it('should create instance of router when no options are given', () => {
		const router = new WorkoutRouter();
		expect(router).toBeDefined();
	});

	describe('GET /workout query parameters', function () {
		it('200 GET /workout without query parameters returns a list of workouts', function (done) {
			_workoutService.expects('getWorkouts').returns([workoutMongo]);
			request.get('/')
				.expect(HttpStatus.OK)
				.end(function (err, res) {
					done(err);
					expect(res.body.data).toBeDefined();
					expect(res.body.data).toEqual([workoutMongo]);
					verifyAll();
					done();
				});
		});
	});

	describe('GET /workout/{id}', function () {
		it('200 Get specific workout.', function (done) {
			_workoutService.expects('getWorkout').withArgs(user.id, workoutMongo.id).resolves(workoutMongo);

			request.get(`/${workoutMongo.id}`)
				.expect(HttpStatus.OK)
				.end(function (err, res) {
					done(err);
					expect(res.body).toBeDefined();
					expect(res.body.data).toEqual(workoutMongo);
					verifyAll();
					done();
				});
		});

		it('404 The specified workout does not exist', function (done) {
			_workoutService.expects('getWorkout').withArgs(user.id, workoutMongo.id).resolves(null);
			request.get(`/${workoutMongo.id}`)
				.expect(HttpStatus.NOT_FOUND)
				.end(function (err, res) {
					done(err);
					verifyAll();
					done();
				});
		});
	});

	describe('POST /workout', function () {
		let createWorkoutPostBody;

		beforeEach(function () {
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

		it('415 Content-type is not JSON', function (done) {
			request.post('/')
				.send('This is a string')
				.expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
				.end(function (err, res) {
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

	describe('POST /workout/{id}', () => {
		const payload = {
			'data': {
				'score': 'Very rare'
			}
		};

		it('should return 201 if score is added successfully', async (done) => {
			const updatedWorkout = workoutMongo;
			updatedWorkout.scores.push(payload.data.score);

			_workoutService.expects('addScore').withArgs(user.id, workoutMongo.id, payload.data.score).resolves(updatedWorkout);

			try {
				const res = await request.post(`/${workoutMongo.id}`).send(payload);
				expect(res.status).toBe(HttpStatus.CREATED);
				expect(res.body).toBeDefined();
				expect(res.body.data).toBeDefined();
				expect(res.body.data).toHaveProperty('name', workoutMongo.name);
				expect(res.body.data).toHaveProperty('type', workoutMongo.type);
				expect(res.body.data).toHaveProperty('scores');
				expect(res.body.data.scores.length).toBe(2);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 500 internal server error if a workout could not be updated', async (done) => {
			_workoutService.expects('addScore').withArgs(user.id, workoutMongo.id, payload.data.score).rejects();

			try {
				const res = await request.post(`/${workoutMongo.id}`).send(payload);
				expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
				expect(res.body).toBeDefined();
				expect(res.body.msg).toBeDefined();
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('GET /workout/{id}/scores', () => {
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
			const err = new ExpressError('Object not found', `Entity with identity '${workoutMongo.id}' does not exist`, HttpStatus.NOT_FOUND);
			_workoutService.expects('getWorkoutScores').withExactArgs(user.id, workoutMongo.id).rejects(err);

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

	describe('POST /workout/{id}/scores', () => {
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
			const err = new ExpressError('Object not found', `Entity with identity '${workoutMongo.id}' does not exist`, HttpStatus.NOT_FOUND);
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
