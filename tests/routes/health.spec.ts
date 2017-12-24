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

	it('serves /health', (done) => {
		request.get('/')
			.expect(200)
			.end((err, res) => {
				expect(err).toBeNull();
				done();
			});
	});
});
