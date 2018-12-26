import { MongoClient, Db } from 'mongodb';
import * as request from 'request-promise-native';
import * as HttpStatus from 'http-status-codes';
import tokens from './data/tokens';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wodbook-test';

describe('Workout component tests', () => {
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
		await db.collection('workouts').deleteMany({});
		await db.collection('workoutscores').deleteMany({});
	});

	afterAll(async () => {
		await mongoClient.close();
	});

	describe('creating workouts', () => {
		it('should create a new workout. This should return Created (201)', async (done) => {
			const wod = {
				name: 'Fran',
				measurement: 'time',
				description: '21-15-9 Thruster (42.5kg / 30kg) / Pull ups'
			};

			try {
				const res1 = await request.post(`/workouts`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						name: wod.name,
						measurement: wod.measurement,
						description: wod.description
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('id');
				const workoutId = res1.body.id;
				expect(res1.body).toHaveProperty('createdAt');
				expect(res1.body).toHaveProperty('updatedAt');
				expect(res1.body).toHaveProperty('userId');
				expect(res1.body).toHaveProperty('description', wod.description);
				expect(res1.body).toHaveProperty('global', false);
				expect(res1.body).toHaveProperty('measurement', wod.measurement);
				expect(res1.body).toHaveProperty('name', wod.name);

				const res2 = await request.get(`/workouts/${workoutId}`, {
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
				expect(res2.body).toHaveProperty('userId');
				expect(res2.body).toHaveProperty('description', wod.description);
				expect(res2.body).toHaveProperty('global', false);
				expect(res2.body).toHaveProperty('measurement', wod.measurement);
				expect(res2.body).toHaveProperty('name', wod.name);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should get 409 Conflict if creating the same workout more than once', async (done) => {
			const workout = {
				name: 'Cindy',
				measurement: 'repetitions',
				description: 'AMRAP20: 5 pull ups, 10 push ups, 15 air squats'
			};

			try {
				const payload = {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: workout
				};

				const res1 = await request.post(`/workouts`, payload);

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('id');
				expect(res1.body).toHaveProperty('createdAt');
				expect(res1.body).toHaveProperty('updatedAt');
				expect(res1.body).toHaveProperty('userId');
				expect(res1.body).toHaveProperty('description', workout.description);
				expect(res1.body).toHaveProperty('global', false);
				expect(res1.body).toHaveProperty('measurement', workout.measurement);
				expect(res1.body).toHaveProperty('name', workout.name);

				const res2 = await request.post(`/workouts`, payload);

				expect(res2.statusCode).toBe(HttpStatus.CONFLICT);
				expect(res2.body).toHaveProperty('status', HttpStatus.CONFLICT);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should get 422 Unprocessable entity if using bogus measurement', async (done) => {
			try {
				const res = await request.post(`/workouts`, {
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

	describe('workout scores', () => {
		it('should create a new workout and add scores to it', async (done) => {
			const wod = {
				name: 'Heavy Fran',
				measurement: 'time',
				description: '15-12-9 Thruster (60kg / 45kg) / Chest to bar (weighted)'
			};

			try {
				const res1 = await request.post(`/workouts`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						name: wod.name,
						measurement: wod.measurement,
						description: wod.description
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('id');
				const workoutId = res1.body.id;
				expect(res1.body).toHaveProperty('createdAt');
				expect(res1.body).toHaveProperty('updatedAt');
				expect(res1.body).toHaveProperty('userId');
				expect(res1.body).toHaveProperty('description', wod.description);
				expect(res1.body).toHaveProperty('global', false);
				expect(res1.body).toHaveProperty('measurement', wod.measurement);
				expect(res1.body).toHaveProperty('name', wod.name);

				const res2 = await request.post(`/workouts/${workoutId}/scores`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						score: '4:20',
						measurement: 'time',
						rx: true
					}
				});

				expect(res2.statusCode).toBe(HttpStatus.CREATED);
				expect(res2.body).toHaveProperty('id');
				expect(res2.body).toHaveProperty('createdAt');
				expect(res2.body).toHaveProperty('updatedAt');
				expect(res2.body).toHaveProperty('workoutId', workoutId);
				expect(res2.body).toHaveProperty('score', '4:20');
				expect(res2.body).toHaveProperty('rx', true);

				const res3 = await request.get(`/workouts/${workoutId}/scores`, {
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
				expect(res3.body.data[0]).toHaveProperty('workoutId');
				expect(res3.body.data[0]).toHaveProperty('score');
				expect(res3.body.data[0]).toHaveProperty('rx');
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('user separated workouts', () => {
		it('should not return workouts created by other users', async (done) => {
			const wod = {
				name: 'Annie',
				measurement: 'time',
				description: '50-40-30-20-10 Double unders / Sit ups'
			};

			try {
				const res1 = await request.post(`/workouts`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						name: wod.name,
						measurement: wod.measurement,
						description: wod.description
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('id');
				const workoutId = res1.body.id;
				expect(res1.body).toHaveProperty('createdAt');
				expect(res1.body).toHaveProperty('updatedAt');
				expect(res1.body).toHaveProperty('userId');
				expect(res1.body).toHaveProperty('description', wod.description);
				expect(res1.body).toHaveProperty('global', false);
				expect(res1.body).toHaveProperty('measurement', wod.measurement);
				expect(res1.body).toHaveProperty('name', wod.name);

				const res2 = await request.get(`/workouts/${workoutId}`, {
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
				expect(res2.body).toHaveProperty('userId');
				expect(res2.body).toHaveProperty('description', wod.description);
				expect(res2.body).toHaveProperty('global', false);
				expect(res2.body).toHaveProperty('measurement', wod.measurement);
				expect(res2.body).toHaveProperty('name', wod.name);

				const res3 = await request.get(`/workouts/${workoutId}`, {
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
