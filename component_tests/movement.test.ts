import * as request from 'request-promise';
import * as HttpStatus from 'http-status-codes';
import CompTestInit from './init';
import tokens from './data/tokens';

const baseUrl = `${(process.env.API_URL || 'http://127.0.0.1:43210')}/v1`;

describe('Movement component tests', () => {
	const reqOpts: request.RequestPromiseOptions = {
		json: true,
		resolveWithFullResponse: true, // Get the full response instead of just the body
		simple: false, // Get a rejection only if the request failed for technical reasons
		baseUrl: baseUrl
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

	describe('creating movements', () => {
		it('should create a new movement. This should return Created (201)', async (done) => {
			const movement = {
				name: 'Snatch',
				measurement: 'weight'
			};

			try {
				const res1 = await request.post(`movements`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						data: {
							name: movement.name,
							measurement: movement.measurement,
						}
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('data');
				expect(res1.body.data).toHaveProperty('_id');
				const movementId = res1.body.data._id;
				expect(res1.body.data).toHaveProperty('createdAt');
				expect(res1.body.data).toHaveProperty('updatedAt');
				expect(res1.body.data).toHaveProperty('createdBy');
				expect(res1.body.data).toHaveProperty('measurement', movement.measurement);
				expect(res1.body.data).toHaveProperty('name', movement.name);

				const res2 = await request.get(`movements/${movementId}`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					}
				});

				expect(res2.statusCode).toBe(HttpStatus.OK);
				expect(res2.body).toHaveProperty('data');
				expect(res2.body.data).toHaveProperty('_id');
				expect(res2.body.data).toHaveProperty('createdAt');
				expect(res2.body.data).toHaveProperty('updatedAt');
				expect(res2.body.data).toHaveProperty('createdBy');
				expect(res2.body.data).toHaveProperty('measurement', movement.measurement);
				expect(res2.body.data).toHaveProperty('name', movement.name);

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
					body: {
						data: {
							name: movement.name,
							measurement: movement.measurement,
						}
					}
				};

				const res1 = await request.post(`movements`, payload);

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('data');
				expect(res1.body.data).toHaveProperty('_id');
				expect(res1.body.data).toHaveProperty('createdAt');
				expect(res1.body.data).toHaveProperty('updatedAt');
				expect(res1.body.data).toHaveProperty('createdBy');
				expect(res1.body.data).toHaveProperty('measurement', movement.measurement);
				expect(res1.body.data).toHaveProperty('name', movement.name);

				const res2 = await request.post(`movements`, payload);

				expect(res2.statusCode).toBe(HttpStatus.CONFLICT);
				expect(res2.body).toHaveProperty('status', HttpStatus.CONFLICT);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should get 422 Unprocessable entity if using bogus measurement', async (done) => {
			try {
				const res = await request.post(`movements`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						data: {
							name: 'Invalid',
							measurement: 'spliff'
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

	describe('movement scores', () => {
		it('should create a new movement and add a score for it', async (done) => {
			const movement = {
				name: 'Deadlift',
				measurement: 'weight',
			};

			const scoreDate = '2012-12-24';

			try {
				const res1 = await request.post(`movements`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						data: {
							name: movement.name,
							measurement: movement.measurement,
						}
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('data');
				expect(res1.body.data).toHaveProperty('_id');
				const movementId = res1.body.data._id;
				expect(res1.body.data).toHaveProperty('createdAt');
				expect(res1.body.data).toHaveProperty('updatedAt');
				expect(res1.body.data).toHaveProperty('createdBy');
				expect(res1.body.data).toHaveProperty('measurement', movement.measurement);
				expect(res1.body.data).toHaveProperty('name', movement.name);

				const res2 = await request.post(`movements/${movementId}/scores`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						data: {
							score: '200kg',
							measurement: 'weight',
							createdAt: scoreDate
						}
					}
				});

				expect(res2.statusCode).toBe(HttpStatus.CREATED);
				expect(res2.body.data).toHaveProperty('_id');
				expect(res2.body.data).toHaveProperty('createdAt', new Date(scoreDate).toISOString());
				expect(res2.body.data).toHaveProperty('updatedAt');
				expect(res2.body.data).toHaveProperty('parentId', movementId);
				expect(res2.body.data).toHaveProperty('score', '200kg');

				const res3 = await request.get(`movements/${movementId}/scores`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					}
				});

				expect(res3.statusCode).toBe(HttpStatus.OK);
				expect(res3.body.data).toHaveProperty('length', 1);
				expect(res3.body.data[0]).toHaveProperty('_id');
				expect(res3.body.data[0]).toHaveProperty('createdAt');
				expect(res3.body.data[0]).toHaveProperty('updatedAt');
				expect(res3.body.data[0]).toHaveProperty('parentId');
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
				const res1 = await request.post(`movements`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					},
					body: {
						data: {
							name: movement.name,
							measurement: movement.measurement,
						}
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.CREATED);
				expect(res1.body).toHaveProperty('data');
				expect(res1.body.data).toHaveProperty('_id');
				const movementId = res1.body.data._id;
				expect(res1.body.data).toHaveProperty('createdAt');
				expect(res1.body.data).toHaveProperty('updatedAt');
				expect(res1.body.data).toHaveProperty('createdBy');
				expect(res1.body.data).toHaveProperty('measurement', movement.measurement);
				expect(res1.body.data).toHaveProperty('name', movement.name);

				const res2 = await request.get(`movements/${movementId}`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					}
				});

				expect(res2.statusCode).toBe(HttpStatus.OK);
				expect(res2.body).toHaveProperty('data');
				expect(res2.body.data).toHaveProperty('_id');
				expect(res2.body.data).toHaveProperty('createdAt');
				expect(res2.body.data).toHaveProperty('updatedAt');
				expect(res2.body.data).toHaveProperty('createdBy');
				expect(res2.body.data).toHaveProperty('measurement', movement.measurement);
				expect(res2.body.data).toHaveProperty('name', movement.name);

				const res3 = await request.get(`movements/${movementId}`, {
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
