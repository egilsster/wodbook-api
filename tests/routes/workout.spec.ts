import * as supertest from 'supertest';
import * as sinon from 'sinon';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import { WorkoutRouter } from '../../src/routes/workout';
import { TrainingService } from '../../src/services/training';
import { ExpressError } from '../../src/utils/express.error';
import { RouterUtils } from '../../src/utils/router.utils';

describe('Workout endpoint', () => {
	const user = {
		'id': 'userId',
		'email': 'user@email.com'
	};
	let request: supertest.SuperTest<supertest.Test>;
	let workoutRouter: WorkoutRouter;
	let workoutMongo;
	let trainingService: TrainingService;
	let _trainingService: sinon.SinonMock;
	let app: express.Application;

	let modelInstance;
	class MockModel {
		constructor() { return modelInstance; }
		save() { return null; }
		static find() { return null; }
		static findOne() { return null; }
		static ensureIndexes() { return null; }
	}

	beforeEach(() => {
		trainingService = new TrainingService(MockModel, MockModel);
		_trainingService = sinon.mock(trainingService);

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
			trainingService,
			logger
		});
		workoutRouter.initRoutes();

		app = express();
		app.use((req, _res, next) => {
			req['user'] = user;
			next();
		});
		app.use('/', workoutRouter.router);
		app.use(RouterUtils.errorHandler);
		request = supertest(app);
	});

	afterEach(() => {
		_trainingService.verify();
	});

	it('should create instance of router when no options are given', () => {
		const router = new WorkoutRouter();
		expect(router).toBeDefined();
	});

	describe('GET /workouts query parameters', () => {
		it('200 GET /workouts without query parameters returns a list of workouts', (done) => {
			_trainingService.expects('getMany').returns([workoutMongo]);
			request.get('/')
				.expect(HttpStatus.OK)
				.end((err, res) => {
					done(err);
					expect(res.body.data).toBeDefined();
					expect(res.body.data).toEqual([workoutMongo]);
					done();
				});
		});
	});

	describe('GET /workouts/{id}', () => {
		it('200 Get specific workout.', (done) => {
			_trainingService.expects('getOne').withArgs(user.id, workoutMongo.id).resolves(workoutMongo);

			request.get(`/${workoutMongo.id}`)
				.expect(HttpStatus.OK)
				.end((err, res) => {
					done(err);
					expect(res.body).toBeDefined();
					expect(res.body.data).toEqual(workoutMongo);
					done();
				});
		});

		it('404 The specified workout does not exist', (done) => {
			_trainingService.expects('getOne').withArgs(user.id, workoutMongo.id).resolves(null);
			request.get(`/${workoutMongo.id}`)
				.expect(HttpStatus.NOT_FOUND)
				.end((err, _res) => {
					done(err);
					done();
				});
		});
	});

	describe('POST /workouts', () => {
		let createPostBody;

		beforeEach(() => {
			createPostBody = {
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
				.end((err, _res) => {
					done(err);
					done();
				});
		});

		it('201 Successful workout creation', async (done) => {
			_trainingService.expects('create').withArgs(createPostBody.data).returns(workoutMongo);

			try {
				const res = await request.post('/')
					.send(createPostBody);
				expect(res.status).toBe(HttpStatus.CREATED);
				expect(res.body.data).toEqual(workoutMongo);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 500 if workout could not be created', async (done) => {
			_trainingService.expects('create').withArgs(createPostBody.data).rejects();

			try {
				const res = await request.post('/')
					.send(createPostBody);
				expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('GET /workouts/{id}/scores', () => {
		const scores = ['score1', 'score2'];

		it('should return 200 with a non-empty list of scores for a workout if it has scores registered', async (done) => {
			_trainingService.expects('getScores').withExactArgs(user.id, workoutMongo.id).resolves(scores);

			try {
				const res = await request.get(`/${workoutMongo.id}/scores`);
				expect(res.status).toBe(HttpStatus.OK);
				expect(res.body).toHaveProperty('data', scores);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 200 with an empty list of scores for a workout if it has no scores', async (done) => {
			_trainingService.expects('getScores').withExactArgs(user.id, workoutMongo.id).resolves([]);

			try {
				const res = await request.get(`/${workoutMongo.id}/scores`);
				expect(res.status).toBe(HttpStatus.OK);
				expect(res.body).toHaveProperty('data', []);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 404 if the specified workout does not exist', async (done) => {
			const err = new ExpressError(`Entity with identity '${workoutMongo.id}' does not exist`, HttpStatus.NOT_FOUND);
			_trainingService.expects('getScores').withExactArgs(user.id, workoutMongo.id).throws(err);

			try {
				const res = await request.get(`/${workoutMongo.id}/scores`);
				expect(res.status).toBe(HttpStatus.NOT_FOUND);
				expect(res.body).toHaveProperty('status', err.status);
				expect(res.body).toHaveProperty('detail', err.detail);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('POST /workouts/{id}/scores', () => {
		const score = { 'workoutId': 'workoutId' };

		it('should return 201 if score is successfully added to workout', async (done) => {
			_trainingService.expects('addScore').withExactArgs(user.id, workoutMongo.id, score).resolves(score);

			try {
				const res = await request.post(`/${workoutMongo.id}/scores`).send({ 'data': score });
				expect(res.status).toBe(HttpStatus.CREATED);
				expect(res.body).toHaveProperty('data', score);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 404 if the specified workout does not exist', async (done) => {
			const err = new ExpressError(`Entity with identity '${workoutMongo.id}' does not exist`, HttpStatus.NOT_FOUND);
			_trainingService.expects('addScore').withExactArgs(user.id, workoutMongo.id, score).rejects(err);

			try {
				const res = await request.post(`/${workoutMongo.id}/scores`).send({ 'data': score });
				expect(res.status).toBe(HttpStatus.NOT_FOUND);
				expect(res.body).toHaveProperty('status', err.status);
				expect(res.body).toHaveProperty('detail', err.detail);
				done();
			} catch (err) {
				done(err);
			}
		});
	});
});
