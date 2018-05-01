import * as sinon from 'sinon';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import { MongoError } from 'mongodb';
import { RouterUtils } from '../../src/utils/router.utils';
import { ExpressError } from '../../src/utils/express.error';

describe('RouterUtils', () => {
	let routerUtils: RouterUtils;
	let app: express.Application;
	let _app: sinon.SinonMock;
	let config;
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

		config = {
			'rollbar': {
				'token': 123
			},
			'environmentTag': 'localdev',
			'webtokens': {
				'public': 'publicKey'
			},
			'aws': {
				's3': 's3'
			},
			'vault': {
				'option': 1
			},
			'region': 'eu-west-1'
		};

		res = {
			status() { },
			send() { },
			set(header: string) { }
		};
		_res = sinon.mock(res);
	});

	afterEach(() => {
		_app.restore();
		_res.restore();
	});

	function verifyAll() {
		_app.verify();
		_res.verify();
	}

	describe('registerMiddleware', () => {
		it('should register middleware to app', () => {
			_app.expects('use').atLeast(2);
			routerUtils.registerMiddleware(app, logger);
			verifyAll();
		});
	});

	describe('registerRoutes', () => {
		it('should register routes to app', () => {
			_app.expects('use').atLeast(5);
			routerUtils.registerRoutes(app);
			verifyAll();
		});
	});

	describe('errorHandler', () => {
		it('should continue down middleware chain with error if response has been sent', () => {
			const nextFn = sinon.stub();
			const err = new ExpressError('err', 500);
			RouterUtils.errorHandler('error', null, { 'headersSent': true } as any, nextFn);
			expect(nextFn.calledWithExactly('error')).toBeTruthy();
			expect(nextFn.calledOnce).toBeTruthy();
			verifyAll();
		});
	});
});
