import * as supertest from 'supertest';
import * as sinon from 'sinon';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import { MovementRouter } from '../../src/routes/movement';
import { MovementService } from '../../src/services/movement';
import ExpressError from '../../src/utils/express.error';
import RouterUtils from '../../src/utils/router.utils';

describe('Movement endpoint', () => {
	const user = {
		'id': 'userId',
		'email': 'user@email.com'
	};
	let request: supertest.SuperTest<supertest.Test>;
	let movementRouter: MovementRouter;
	let movementMongo;
	let movementService: MovementService;
	let _movementService: sinon.SinonMock;
	let app: express.Application;

	beforeEach(() => {
		movementService = new MovementService();
		_movementService = sinon.mock(movementService);

		movementMongo = {
			'id': '5a4704ca46425f97c638bcaa',
			'name': 'Snatch'
		};

		const logger = {
			debug() { },
			info() { },
			warn() { },
			error() { }
		};

		movementRouter = new MovementRouter({
			movementService,
			logger
		});
		movementRouter.initRoutes();

		app = express();
		app.use((req, res, next) => {
			req['user'] = user;
			next();
		});
		app.use('/', movementRouter.router);
		app.use(RouterUtils.errorHandler);
		request = supertest(app);
	});

	afterEach(() => {
		_movementService.restore();
	});

	function verifyAll() {
		_movementService.verify();
	}

	it('should create instance of router when no options are given', () => {
		const router = new MovementRouter();
		expect(router).toBeDefined();
	});

	describe('GET /movements query parameters', () => {
		it('200 GET /movements without query parameters returns a list of movements', (done) => {
			_movementService.expects('getMovements').returns([movementMongo]);
			request.get('/')
				.expect(HttpStatus.OK)
				.end((err, res) => {
					done(err);
					expect(res.body.data).toBeDefined();
					expect(res.body.data).toEqual([movementMongo]);
					verifyAll();
					done();
				});
		});
	});

	describe('GET /movements/{id}', () => {
		it('200 Get specific movement.', (done) => {
			_movementService.expects('getMovement').withArgs(user.id, movementMongo.id).resolves(movementMongo);

			request.get(`/${movementMongo.id}`)
				.expect(HttpStatus.OK)
				.end((err, res) => {
					done(err);
					expect(res.body).toBeDefined();
					expect(res.body.data).toEqual(movementMongo);
					verifyAll();
					done();
				});
		});

		it('404 The specified movement does not exist', (done) => {
			_movementService.expects('getMovement').withArgs(user.id, movementMongo.id).resolves(null);
			request.get(`/${movementMongo.id}`)
				.expect(HttpStatus.NOT_FOUND)
				.end((err, res) => {
					done(err);
					verifyAll();
					done();
				});
		});
	});

	describe('POST /movements', () => {
		let createMovementPostBody;

		beforeEach(() => {
			createMovementPostBody = {
				'data': {
					'createdBy': user.id,
					'name': 'wodBook'
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

		it('201 Successful movement creation', async (done) => {
			_movementService.expects('createMovement').withArgs(createMovementPostBody.data).returns(movementMongo);

			try {
				const res = await request.post('/')
					.send(createMovementPostBody);
				expect(res.status).toBe(HttpStatus.CREATED);
				expect(res.body.data).toEqual(movementMongo);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 500 if movement could not be created', async (done) => {
			_movementService.expects('createMovement').withArgs(createMovementPostBody.data).rejects();

			try {
				const res = await request.post('/')
					.send(createMovementPostBody);
				expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('GET /movements/{id}/scores', () => {
		const scores = ['score1', 'score2'];

		it('should return 200 with a non-empty list of scores for a movement if it has scores registered', async (done) => {
			_movementService.expects('getMovementScores').withExactArgs(user.id, movementMongo.id).resolves(scores);

			try {
				const res = await request.get(`/${movementMongo.id}/scores`);
				expect(res.status).toBe(HttpStatus.OK);
				expect(res.body).toHaveProperty('data', scores);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 200 with an empty list of scores for a movement if it has no scores', async (done) => {
			_movementService.expects('getMovementScores').withExactArgs(user.id, movementMongo.id).resolves([]);

			try {
				const res = await request.get(`/${movementMongo.id}/scores`);
				expect(res.status).toBe(HttpStatus.OK);
				expect(res.body).toHaveProperty('data', []);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 404 if the specified movement does not exist', async (done) => {
			const err = new ExpressError('Object not found', `Entity with identity '${movementMongo.id}' does not exist`, HttpStatus.NOT_FOUND);
			_movementService.expects('getMovementScores').withExactArgs(user.id, movementMongo.id).throws(err);

			try {
				const res = await request.get(`/${movementMongo.id}/scores`);
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

	describe('POST /movements/{id}/scores', () => {
		const score = { 'movementId': 'movementId' };

		it('should return 201 if score is successfully added to movement', async (done) => {
			_movementService.expects('addScore').withExactArgs(user.id, movementMongo.id, score).resolves(score);

			try {
				const res = await request.post(`/${movementMongo.id}/scores`).send({ 'data': score });
				expect(res.status).toBe(HttpStatus.CREATED);
				expect(res.body).toHaveProperty('data', score);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should return 404 if the specified movement does not exist', async (done) => {
			const err = new ExpressError('Object not found', `Entity with identity '${movementMongo.id}' does not exist`, HttpStatus.NOT_FOUND);
			_movementService.expects('addScore').withExactArgs(user.id, movementMongo.id, score).rejects(err);

			try {
				const res = await request.post(`/${movementMongo.id}/scores`).send({ 'data': score });
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
