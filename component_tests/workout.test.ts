import * as request from 'request-promise';
import * as HttpStatus from 'http-status-codes';
import CompTestInit from './init';
import tokens from './data/tokens';

describe('Workout component tests', () => {
	const reqOpts: request.RequestPromiseOptions = {
		json: true,
		resolveWithFullResponse: true, // Get the full response instead of just the body
		simple: false, // Get a rejection only if the request failed for technical reasons
		baseUrl: `${(process.env.API_URL || 'http://127.0.0.1:43210')}/v1`
	};

	let init: CompTestInit;

	beforeAll(async (done) => {
		try {
			init = new CompTestInit();
			await init.before();
			done();
		} catch (err) {
			done(err);
		}
	});

	afterAll(async (done) => {
		try {
			await init.after();
			done();
		} catch (err) {
			done(err);
		}
	});

	describe('creating workouts', () => {
		it('should create a new workout. This should return Created (201)', async (done) => {
			const wod = {
				'title': 'Fran',
				'measurement': 'time',
				'description': '21-15-9 Thruster (42.5kg / 30kg) / Pull ups'
			};

			try {
				const res1 = await request.post(`workouts`, {
					...reqOpts,
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${tokens.user}`
					},
					'body': {
						'data': {
							'title': wod.title,
							'measurement': wod.measurement,
							'description': wod.description
						}
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('data');
				expect(res1.body.data).toHaveProperty('_id');
				const workoutId = res1.body.data._id;
				expect(res1.body.data).toHaveProperty('createdAt');
				expect(res1.body.data).toHaveProperty('updatedAt');
				expect(res1.body.data).toHaveProperty('createdBy');
				expect(res1.body.data).toHaveProperty('description', wod.description);
				expect(res1.body.data).toHaveProperty('global', false);
				expect(res1.body.data).toHaveProperty('measurement', wod.measurement);
				expect(res1.body.data).toHaveProperty('title', wod.title);

				const res2 = await request.get(`workouts/${workoutId}`, {
					...reqOpts,
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${tokens.user}`
					}
				});

				expect(res2.statusCode).toBe(HttpStatus.OK);
				expect(res2.body).toHaveProperty('data');
				expect(res2.body.data).toHaveProperty('_id');
				expect(res2.body.data).toHaveProperty('createdAt');
				expect(res2.body.data).toHaveProperty('updatedAt');
				expect(res2.body.data).toHaveProperty('createdBy');
				expect(res2.body.data).toHaveProperty('description', wod.description);
				expect(res2.body.data).toHaveProperty('global', false);
				expect(res2.body.data).toHaveProperty('measurement', wod.measurement);
				expect(res2.body.data).toHaveProperty('title', wod.title);

				done();
			} catch (err) {
				done(err);
			}
		});

		it('should get 409 Conflict if creating the same workout more than once', async (done) => {
			const wod = {
				'title': 'Cindy',
				'measurement': 'repetitions',
				'description': 'AMRAP20: 5 pull ups, 10 push ups, 15 air squats'
			};

			try {
				const payload = {
					...reqOpts,
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${tokens.user}`
					},
					'body': {
						'data': {
							'title': wod.title,
							'measurement': wod.measurement,
							'description': wod.description
						}
					}
				};

				const res1 = await request.post(`workouts`, payload);

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('data');
				expect(res1.body.data).toHaveProperty('_id');
				expect(res1.body.data).toHaveProperty('createdAt');
				expect(res1.body.data).toHaveProperty('updatedAt');
				expect(res1.body.data).toHaveProperty('createdBy');
				expect(res1.body.data).toHaveProperty('description', wod.description);
				expect(res1.body.data).toHaveProperty('global', false);
				expect(res1.body.data).toHaveProperty('measurement', wod.measurement);
				expect(res1.body.data).toHaveProperty('title', wod.title);

				const res2 = await request.post(`workouts`, payload);

				expect(res2.statusCode).toBe(HttpStatus.CONFLICT);
				expect(res2.body).toHaveProperty('status', HttpStatus.CONFLICT);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should get 422 Unprocessable entity if using bogus measurement', async (done) => {
			try {
				const res = await request.post(`workouts`, {
					...reqOpts,
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${tokens.user}`
					},
					'body': {
						'data': {
							'title': 'Invalid',
							'measurement': 'spliff'
						}
					}
				});

				expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
				expect(res.body[0]).toHaveProperty('status', HttpStatus.UNPROCESSABLE_ENTITY);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('workout scores', () => {
		it('should create a new workout. This should return Created (201)', async (done) => {
			const wod = {
				'title': 'Heavy Fran',
				'measurement': 'time',
				'description': '15-12-9 Thruster (60kg / 45kg) / Chest to bar (weighted)'
			};

			try {
				const res1 = await request.post(`workouts`, {
					...reqOpts,
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${tokens.user}`
					},
					'body': {
						'data': {
							'title': wod.title,
							'measurement': wod.measurement,
							'description': wod.description
						}
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('data');
				expect(res1.body.data).toHaveProperty('_id');
				const workoutId = res1.body.data._id;
				expect(res1.body.data).toHaveProperty('createdAt');
				expect(res1.body.data).toHaveProperty('updatedAt');
				expect(res1.body.data).toHaveProperty('createdBy');
				expect(res1.body.data).toHaveProperty('description', wod.description);
				expect(res1.body.data).toHaveProperty('global', false);
				expect(res1.body.data).toHaveProperty('measurement', wod.measurement);
				expect(res1.body.data).toHaveProperty('title', wod.title);

				const res2 = await request.post(`workouts/${workoutId}/scores`, {
					...reqOpts,
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${tokens.user}`
					},
					'body': {
						'data': {
							'score': '4:20',
							'measurement': 'time',
							'rx': true
						}
					}
				});

				expect(res2.statusCode).toBe(HttpStatus.CREATED);
				expect(res2.body.data).toHaveProperty('_id');
				expect(res2.body.data).toHaveProperty('createdAt');
				expect(res2.body.data).toHaveProperty('updatedAt');
				expect(res2.body.data).toHaveProperty('workoutId', workoutId);
				expect(res2.body.data).toHaveProperty('score', '4:20');
				expect(res2.body.data).toHaveProperty('rx', true);

				const res3 = await request.get(`workouts/${workoutId}/scores`, {
					...reqOpts,
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${tokens.user}`
					}
				});

				expect(res3.statusCode).toBe(HttpStatus.OK);
				expect(res3.body.data).toHaveProperty('length', 1);
				expect(res3.body.data[0]).toHaveProperty('_id');
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
				'title': 'Annie',
				'measurement': 'time',
				'description': '50-40-30-20-10 Double unders / Sit ups'
			};

			try {
				const res1 = await request.post(`workouts`, {
					...reqOpts,
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${tokens.user}`
					},
					'body': {
						'data': {
							'title': wod.title,
							'measurement': wod.measurement,
							'description': wod.description
						}
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('data');
				expect(res1.body.data).toHaveProperty('_id');
				const workoutId = res1.body.data._id;
				expect(res1.body.data).toHaveProperty('createdAt');
				expect(res1.body.data).toHaveProperty('updatedAt');
				expect(res1.body.data).toHaveProperty('createdBy');
				expect(res1.body.data).toHaveProperty('description', wod.description);
				expect(res1.body.data).toHaveProperty('global', false);
				expect(res1.body.data).toHaveProperty('measurement', wod.measurement);
				expect(res1.body.data).toHaveProperty('title', wod.title);

				const res2 = await request.get(`workouts/${workoutId}`, {
					...reqOpts,
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${tokens.user}`
					}
				});

				expect(res2.statusCode).toBe(HttpStatus.OK);
				expect(res2.body).toHaveProperty('data');
				expect(res2.body.data).toHaveProperty('_id');
				expect(res2.body.data).toHaveProperty('createdAt');
				expect(res2.body.data).toHaveProperty('updatedAt');
				expect(res2.body.data).toHaveProperty('createdBy');
				expect(res2.body.data).toHaveProperty('description', wod.description);
				expect(res2.body.data).toHaveProperty('global', false);
				expect(res2.body.data).toHaveProperty('measurement', wod.measurement);
				expect(res2.body.data).toHaveProperty('title', wod.title);

				const res3 = await request.get(`workouts/${workoutId}`, {
					...reqOpts,
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${tokens.admin}`
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
