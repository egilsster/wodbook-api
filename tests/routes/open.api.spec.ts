import * as Koa from 'koa';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import * as YAML from 'yamljs';
import * as HttpStatus from 'http-status-codes';
import { OpenApiRouter } from '../../src/routes';

describe('OpenApi Router', () => {
	let _yamljs: sinon.SinonMock;

	beforeEach(() => {
		_yamljs = sinon.mock(YAML);
	});

	afterEach(() => {
		_yamljs.verify();
	});

	describe('getApi', () => {
		it('should handle GET /openapi', async () => {
			const router = new OpenApiRouter();

			const app = new Koa();
			router.init(app);
			const server = app.listen();
			const request = supertest(server);

			try {
				router.getApi = async (ctx) => { ctx.status = HttpStatus.OK; };
				await request.get('/openapi').expect(HttpStatus.OK);
			} finally {
				server.close();
			}
		});

		it('Should return 200 on a healthy server', async () => {
			_yamljs.expects('load').withArgs('./api-docs.yml').returns('docs');
			const openApiRouter = new OpenApiRouter();

			const ctx = {} as Koa.Context;
			await openApiRouter.getApi(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
			expect(ctx.body).toEqual('docs');
		});
	});

	describe('init', () => {
		it('Should initialize the app', async () => {
			const app = {
				use: function (routesMiddleware) {
					this.routesMiddleware = routesMiddleware;
				}
			} as any;
			const appUseSpy = sinon.spy(app, 'use');
			const openApiRouter = new OpenApiRouter(app);
			openApiRouter.init(app);

			expect(appUseSpy.calledOnce).toBe(true);
		});
	});
});
