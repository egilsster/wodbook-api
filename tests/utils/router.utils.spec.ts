import * as sinon from 'sinon';
import * as express from 'express';
import { RouterUtils } from '../../src/utils/router.utils';

describe('RouterUtils', () => {
	let routerUtils: RouterUtils;
	let app: express.Application;
	let _app: sinon.SinonMock;
	let res;
	let _res: sinon.SinonMock;
	let logger;

	beforeEach(() => {
		app = express();
		_app = sinon.mock(app);

		logger = {
			info() { },
			warn() { },
			error() { }
		};

		routerUtils = new RouterUtils({ logger });

		res = {
			status() { },
			send() { },
		};
		_res = sinon.mock(res);
	});

	afterEach(() => {
		_app.verify();
		_res.verify();
	});

	describe('registerMiddleware', () => {
		it('should register middleware to app', () => {
			_app.expects('use').atLeast(2);
			routerUtils.registerMiddleware(app, logger);
		});
	});

	describe('registerRoutes', () => {
		it('should register routes to app', () => {
			_app.expects('use').atLeast(5);
			routerUtils.registerRoutes(app);
		});
	});

	describe('errorHandler', () => {
		it('should continue down middleware chain with error if response has been sent', () => {
			const nextFn = sinon.stub();
			RouterUtils.errorHandler('error', null as any, { 'headersSent': true } as any, nextFn);
			expect(nextFn.calledWithExactly('error')).toBeTruthy();
			expect(nextFn.calledOnce).toBeTruthy();
		});
	});
});
