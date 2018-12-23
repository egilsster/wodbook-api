import * as request from 'request-promise-native';
import * as HttpStatus from 'http-status-codes';
import CompTestInit from './init';
import tokens from './data/tokens';

describe('User component tests', () => {
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

	describe('user profile', () => {
		it('should get information for the logged in user (non admin)', async (done) => {
			try {
				const res1 = await request.get(`users/me`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.user}`
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.OK);
				expect(res1.body).toHaveProperty('data');
				expect(res1.body.data).toHaveProperty('firstName', 'Greg');
				expect(res1.body.data).toHaveProperty('lastName', 'Sestero');
				expect(res1.body.data).toHaveProperty('boxName', 'The Room');
				expect(res1.body.data).toHaveProperty('email', 'user@email.com');
				expect(res1.body.data).toHaveProperty('gender', 'male');
				expect(res1.body.data).toHaveProperty('height', 187);
				expect(res1.body.data).toHaveProperty('weight', 89000);
				expect(res1.body.data).toHaveProperty('dateOfBirth');
				expect(res1.body.data).not.toHaveProperty('password');

				done();
			} catch (err) {
				done(err);
			}
		});

		it('should include id of user if logged in user is admin (admin)', async (done) => {
			try {
				const res1 = await request.get(`users/me`, {
					...reqOpts,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokens.admin}`
					}
				});

				expect(res1.statusCode).toBe(HttpStatus.OK);
				expect(res1.body).toHaveProperty('data');
				expect(res1.body.data).toHaveProperty('id');
				expect(res1.body.data).toHaveProperty('firstName', 'Tommy');
				expect(res1.body.data).toHaveProperty('lastName', 'Wiseau');
				expect(res1.body.data).toHaveProperty('boxName', 'The Room');
				expect(res1.body.data).toHaveProperty('email', 'admin@email.com');
				expect(res1.body.data).toHaveProperty('gender', 'male');
				expect(res1.body.data).toHaveProperty('height', 174);
				expect(res1.body.data).toHaveProperty('weight', 85000);
				expect(res1.body.data).toHaveProperty('dateOfBirth');
				expect(res1.body.data).not.toHaveProperty('password');

				done();
			} catch (err) {
				done(err);
			}
		});
	});
});
