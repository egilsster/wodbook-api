import * as request from 'request-promise-native';
import * as HttpStatus from 'http-status-codes';

const baseUrl = process.env.API_URL || 'http://127.0.0.1:43210';

describe('Wodbook General Tests', () => {
	const reqOpts: request.RequestPromiseOptions = {
		resolveWithFullResponse: true,
		baseUrl: baseUrl
	};

	describe('unauthenticated endpoints', () => {
		it('/health should return 200 OK', async () => {
			const res = await request.get(`/health`, reqOpts);
			expect(res.statusCode).toBe(HttpStatus.OK);
		});

		it('/api-docs yaml file should be returned', async () => {
			const res = await request.get(`/openapi`, reqOpts);
			expect(res.statusCode).toBe(HttpStatus.OK);
			expect(res.body.length).toBeGreaterThan(0);
		});
	});
});
