import * as sinon from 'sinon';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import { MongoError } from 'mongodb';
import RouterUtils from '../../src/utils/router.utils';
import ExpressError from '../../src/utils/express.error';

describe('RouterUtils', () => {
	let routerUtils: RouterUtils;
	let app: express.Application;
	let _app: sinon.SinonMock;
	let config;
	let res;
	let _res: sinon.SinonMock;

	beforeEach(() => {
		app = express();
		_app = sinon.mock(app);

		routerUtils = new RouterUtils();

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
			_app.expects('use').exactly(0);
			routerUtils.registerMiddleware(app);
			verifyAll();
		});
	});

	describe('registerRoutes', () => {
		it('should register routes to app', () => {
			_app.expects('use').exactly(5);
			routerUtils.registerRoutes(app);
			verifyAll();
		});
	});

	describe('errorHandler', () => {
		it('should continue down middleware chain with error if response has been sent', () => {
			const nextFn = sinon.stub();
			RouterUtils.errorHandler('error', null, { 'headersSent': true } as any, nextFn);
			expect(nextFn.calledWithExactly('error')).toBeTruthy();
			expect(nextFn.calledOnce).toBeTruthy();
			verifyAll();
		});

		it('should set status code as 500 Internal Server Error if generic error is caught', () => {
			const err = new Error('msg');
			_res.expects('status').withArgs(HttpStatus.INTERNAL_SERVER_ERROR).returns(res);
			_res.expects('send').exactly(1);
			RouterUtils.errorHandler(err, null, res, null);
			verifyAll();
		});

		it('should set status code from error if express error is caught', () => {
			const err = new ExpressError('title', 'detail', HttpStatus.NOT_FOUND);
			_res.expects('status').withArgs(err.status).returns(res);
			_res.expects('send').exactly(1);
			RouterUtils.errorHandler(err, null, res, null);
			verifyAll();
		});

		it('should set status code as 400 Bad Request if mongoose validation error is caught', () => {
			const err = { 'name': 'ValidationError' };
			_res.expects('status').withArgs(HttpStatus.UNPROCESSABLE_ENTITY).returns(res);
			_res.expects('send').exactly(1);
			RouterUtils.errorHandler(err, null, res, null);
			verifyAll();
		});

		it('should MongoError with code 11000 is caught', () => {
			const err = new MongoError('error');
			err.code = 11001;
			_res.expects('status').withArgs(HttpStatus.CONFLICT).returns(res);
			_res.expects('send').exactly(1);
			RouterUtils.errorHandler(err, null, res, null);
			verifyAll();
		});
	});
});
