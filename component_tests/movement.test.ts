import { MongoClient, Db } from 'mongodb';
import * as request from 'request-promise-native';
import * as HttpStatus from 'http-status-codes';
import tokens from './data/tokens';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wodbook-test';

describe('Movement component tests', () => {
	const reqOpts: request.RequestPromiseOptions = {
		json: true,
		resolveWithFullResponse: true, // Get the full response instead of just the body
		simple: false, // Get a rejection only if the request failed for technical reasons
		baseUrl: `${(process.env.API_URL || 'http://127.0.0.1:43210')}/v1`
	};

	let mongoClient: MongoClient;
	let db: Db;

	beforeAll(async () => {
		mongoClient = await MongoClient.connect(MONGO_URI, { useNewUrlParser: true });
		db = mongoClient.db();
	});

	afterEach(async () => {
		await db.collection('movements').deleteMany({});
		await db.collection('movementscores').deleteMany({});
	});

	afterAll(async () => {
		await mongoClient.close();
	});

	describe('creating movements', () => {
		it('should create a new movement. This should return Created (201)', async (done) => {
			const movement = {
				name: 'Snatch',
				measurement: 'weight'
			};

			try {
				const res1 = await request.post(`/movements`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						name: movement.name,
						measurement: movement.measurement,
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('id');
				const movementId = res1.body.id;
				expect(res1.body).toHaveProperty('createdAt');
				expect(res1.body).toHaveProperty('updatedAt');
				expect(res1.body).toHaveProperty('measurement', movement.measurement);
				expect(res1.body).toHaveProperty('name', movement.name);

				const res2 = await request.get(`/movements/${movementId}`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					}
				});

				expect(res2.statusCode).toBe(HttpStatus.OK);
				expect(res2.body).toHaveProperty('id');
				expect(res2.body).toHaveProperty('createdAt');
				expect(res2.body).toHaveProperty('updatedAt');
				expect(res2.body).toHaveProperty('measurement', movement.measurement);
				expect(res2.body).toHaveProperty('name', movement.name);

				done();
			} catch (err) {
				done(err);
			}
		});

		it('should get 409 Conflict if creating the same movement more than once', async (done) => {
			const movement = {
				name: 'Thruster',
				measurement: 'weight',
			};

			try {
				const payload = {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: movement
				};

				const res1 = await request.post(`/movements`, payload);

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('id');
				expect(res1.body).toHaveProperty('createdAt');
				expect(res1.body).toHaveProperty('updatedAt');
				expect(res1.body).toHaveProperty('measurement', movement.measurement);
				expect(res1.body).toHaveProperty('name', movement.name);

				const res2 = await request.post(`/movements`, payload);

				expect(res2.statusCode).toBe(HttpStatus.CONFLICT);
				expect(res2.body).toHaveProperty('status', HttpStatus.CONFLICT);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should get 422 Unprocessable entity if using bogus measurement', async (done) => {
			try {
				const res = await request.post(`/movements`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						name: 'Invalid',
						measurement: 'spliff'
					}
				});

				expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('movement scores', () => {
		it('should create a new movement and add a score for it', async (done) => {
			const movement = {
				name: 'Deadlift',
				measurement: 'weight',
			};

			const scoreDate = new Date('2012-12-24');

			try {
				const res1 = await request.post(`/movements`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						name: movement.name,
						measurement: movement.measurement,
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('id');
				const movementId = res1.body.id;
				expect(res1.body).toHaveProperty('createdAt');
				expect(res1.body).toHaveProperty('updatedAt');
				expect(res1.body).toHaveProperty('measurement', movement.measurement);
				expect(res1.body).toHaveProperty('name', movement.name);

				const res2 = await request.post(`/movements/${movementId}/scores`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						score: '200kg',
						measurement: 'weight',
						createdAt: scoreDate
					}
				});

				expect(res2.statusCode).toBe(HttpStatus.CREATED);
				expect(res2.body).toHaveProperty('id');
				expect(res2.body).toHaveProperty('createdAt', scoreDate.toISOString());
				expect(res2.body).toHaveProperty('updatedAt');
				expect(res2.body).toHaveProperty('movementId', movementId);
				expect(res2.body).toHaveProperty('score', '200kg');

				const res3 = await request.get(`/movements/${movementId}/scores`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					}
				});

				expect(res3.statusCode).toBe(HttpStatus.OK);
				expect(res3.body.data).toHaveProperty('length', 1);
				expect(res3.body.data[0]).toHaveProperty('id');
				expect(res3.body.data[0]).toHaveProperty('createdAt');
				expect(res3.body.data[0]).toHaveProperty('updatedAt');
				expect(res3.body.data[0]).toHaveProperty('movementId');
				expect(res3.body.data[0]).toHaveProperty('score');
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('user separated movements', () => {
		it('should not return movements created by other users', async (done) => {
			const movement = {
				name: 'Bench press',
				measurement: 'weight',
			};

			try {
				const res1 = await request.post(`/movements`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						name: movement.name,
						measurement: movement.measurement,
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('id');
				const movementId = res1.body.id;
				expect(res1.body).toHaveProperty('createdAt');
				expect(res1.body).toHaveProperty('updatedAt');
				expect(res1.body).toHaveProperty('measurement', movement.measurement);
				expect(res1.body).toHaveProperty('name', movement.name);

				const res2 = await request.get(`/movements/${movementId}`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					}
				});

				expect(res2.statusCode).toBe(HttpStatus.OK);
				expect(res2.body).toHaveProperty('id');
				expect(res2.body).toHaveProperty('createdAt');
				expect(res2.body).toHaveProperty('updatedAt');
				expect(res2.body).toHaveProperty('measurement', movement.measurement);
				expect(res2.body).toHaveProperty('name', movement.name);

				const res3 = await request.get(`/movements/${movementId}`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.admin}`
					}
				});

				expect(res3.statusCode).toBe(HttpStatus.NOT_FOUND);

				done();
			} catch (err) {
				done(err);
			}
		});
	});
});
