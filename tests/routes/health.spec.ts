import * as supertest from 'supertest';
import * as express from 'express';

import HealthRouter from '../../src/routes/health';

describe('Health endpoint', () => {
	let app: express.Application;
	let request: supertest.SuperTest<supertest.Test>;

	beforeEach(() => {
		app = express();
		const healthRouter = new HealthRouter();
		app.use('/', healthRouter.router);

		request = supertest(app);
	});

	it('should serve 200 OK from /health', async (done) => {
		try {
			const res = await request.get('/');
			expect(res.status).toEqual(200);
			done();
		} catch (err) {
			done(err);
		}
	});
});
