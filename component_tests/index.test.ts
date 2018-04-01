import * as request from 'request-promise';
import * as HttpStatus from 'http-status-codes';
import CompTestInit from './init';

describe('Wodbook General Tests', () => {
	const reqOpts: request.RequestPromiseOptions = {
		resolveWithFullResponse: true,
		baseUrl: process.env.API_URL || 'http://127.0.0.1:43210'
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

	describe('unauthenticated endpoints', () => {
		it('/health should return 200 OK', async (done) => {
			try {
				const res = await request.get(`/health`, { json: true, ...reqOpts });
				expect(res.statusCode).toBe(HttpStatus.OK);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('/api-docs yaml file should be returned', async (done) => {
			try {
				const res = await request.get(`/api-docs`, reqOpts);
				expect(res.statusCode).toBe(HttpStatus.OK);
				expect(res.body.length).toBeGreaterThan(0);
				done();
			} catch (err) {
				done(err);
			}
		});
	});
});
