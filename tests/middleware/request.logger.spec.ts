import * as sinon from 'sinon';
import { RequestLogger } from '../../src/middleware/request.logger';

const logger = {
	info() { },
	error() { },
	warn() { },
	verbose() { },
	debug() { },
	silly() { }
};

describe('Request Logger middleware', () => {
	let requestLogger: RequestLogger, _requestLogger: sinon.SinonMock;
	let _logger: sinon.SinonMock;

	beforeEach(() => {
		requestLogger = new RequestLogger({ logger });
		_requestLogger = sinon.mock(requestLogger);
		_logger = sinon.mock(logger);
	});

	afterEach(() => {
		_logger.verify();
		_requestLogger.verify();
	});

	describe('constructor', () => {
		it('should create new instance when options are empty', () => {
			const instance = new RequestLogger({});
			expect(instance).toBeDefined();
		});
	});

	it('request handler properly logs successful requests with masked query parameters', async () => {
		requestLogger = new RequestLogger({ logger, sensitiveQueryParams: ['testcode'] });
		_requestLogger = sinon.mock(requestLogger);
		let finishedHandler;
		let context: any = {
			request: {
				method: 'GET',
				header: { 'X-Test-Header': 'foobar' }
			},
			originalUrl: '/foo/bar?test=asdf&testcode=somethingSomething789',
			body: '',
			res: {
				once: (event, handler) => {
					// koa-logger waits for finish event to log end request log message
					if (event === 'finish') {
						finishedHandler = handler;
					}
				},
				removeListener() {
					finishedHandler = null;
				}
			},
			response: {}
		};
		_requestLogger.expects('transport').withArgs({ headers: { 'X-Test-Header': 'foobar' }, logTraceId: sinon.match.string }, sinon.match.string, [sinon.match(/^ {2}.*<--/), 'GET', '/foo/bar?test=asdf&testcode=***MASKED***']);
		await requestLogger.handle(context, async () => {
			context.status = 200;
		});
		_requestLogger.expects('transport').withArgs({ headers: { 'X-Test-Header': 'foobar' }, logTraceId: sinon.match.string }, sinon.match.string,
			[sinon.match(/^ {2}.*-->/), 'GET', '/foo/bar?test=asdf&testcode=***MASKED***', 200, sinon.match.string, '-']);
		finishedHandler(); // simulate request end
	});

	it('does not log sensitive headers', async () => {
		requestLogger = new RequestLogger({ logger, sensitiveQueryParams: ['testcode'] });
		_requestLogger = sinon.mock(requestLogger);
		let finishedHandler;
		let context: any = {
			request: {
				method: 'GET',
				header: {
					'X-Test-Header': 'foobar',
					authorization: 'uhoh',
					cookie: 'something sensitive',
					something: 'else'
				}
			},
			originalUrl: '/foo/bar',
			body: '',
			res: {
				once: (event, handler) => {
					// koa-logger waits for finish event to log end request log message
					if (event === 'finish') {
						finishedHandler = handler;
					}
				},
				removeListener() {
					finishedHandler = null;
				}
			},
			response: {}
		};
		let expectedHeaders = {
			'X-Test-Header': 'foobar',
			something: 'else'
		};

		_requestLogger.expects('transport').withArgs({ headers: expectedHeaders, logTraceId: sinon.match.string }, sinon.match.string, [sinon.match(/^ {2}.*<--/), 'GET', '/foo/bar']);
		await requestLogger.handle(context, async () => {
			context.status = 200;
		});
		_requestLogger.expects('transport').withArgs({ headers: expectedHeaders, logTraceId: sinon.match.string }, sinon.match.string,
			[sinon.match(/^ {2}.*-->/), 'GET', '/foo/bar', 200, sinon.match.string, '-']);
		finishedHandler(); // simulate request end
	});

	it('does not log sensitive headers', async () => {
		requestLogger = new RequestLogger({
			logger,
			sensitiveQueryParams: ['testcode'],
			headerLoggingBlacklist: ['a', 'b', 'c']
		});
		_requestLogger = sinon.mock(requestLogger);
		let finishedHandler;
		let context: any = {
			request: {
				method: 'GET',
				header: {
					'X-Test-Header': 'foobar',
					authorization: 'uhoh',
					cookie: 'something sensitive',
					something: 'else',
					a: 'hello',
					c: 'heyhey'
				}
			},
			originalUrl: '/foo/bar',
			body: '',
			res: {
				once: (event, handler) => {
					// koa-logger waits for finish event to log end request log message
					if (event === 'finish') {
						finishedHandler = handler;
					}
				},
				removeListener() {
					finishedHandler = null;
				}
			},
			response: {}
		};
		let expectedHeaders = {
			'X-Test-Header': 'foobar',
			authorization: 'uhoh',
			cookie: 'something sensitive',
			something: 'else'
		};

		_requestLogger.expects('transport').withArgs({ headers: expectedHeaders, logTraceId: sinon.match.string }, sinon.match.string, [sinon.match(/^ {2}.*<--/), 'GET', '/foo/bar']);
		await requestLogger.handle(context, async () => {
			context.status = 200;
		});
		_requestLogger.expects('transport').withArgs({ headers: expectedHeaders, logTraceId: sinon.match.string }, sinon.match.string,
			[sinon.match(/^ {2}.*-->/), 'GET', '/foo/bar', 200, sinon.match.string, '-']);
		finishedHandler(); // simulate request end
	});

	it('request handler properly logs error requests with masked query parameters', async () => {
		requestLogger = new RequestLogger({ logger, sensitiveQueryParams: ['testcode'] });
		_requestLogger = sinon.mock(requestLogger);
		let context: any = {
			request: {
				method: 'GET'
			},
			originalUrl: '/foo/bar?test=asdf&testcode=somethingSomething123',
			body: '',
			res: {
				once() { },
				removeListener() { }
			},
			response: {}
		};
		_requestLogger.expects('transport').withArgs({ headers: {}, logTraceId: sinon.match.string }, sinon.match.string, [sinon.match(/^ {2}.*<--/), 'GET', '/foo/bar?test=asdf&testcode=***MASKED***']);
		_requestLogger.expects('transport').withArgs({ headers: {}, logTraceId: sinon.match.string }, sinon.match.string,
			[sinon.match(/^ {2}.*xxx.*/), 'GET', '/foo/bar?test=asdf&testcode=***MASKED***', 500, sinon.match.string, '-']);
		try {
			await requestLogger.handle(context, async () => {
				// context.status = 401
				throw new Error('Testing testing - something went wrong!');
			});
		} catch (err) {
			expect(err.message).toEqual('Testing testing - something went wrong!');
		}
	});

	it('should add itself to the app', () => {
		requestLogger.init({
			use: (middleware) => {
				expect(middleware).toBeDefined();
			}
		});
	});

	it('transport should call logger.verbose', () => {
		_logger.expects('verbose').withArgs('mystring').once();
		requestLogger.transport({}, 'mystring', {});
	});

	it('transport should call logger.verbose with args', () => {
		_logger.expects('verbose').withArgs('mystring', {
			method: '1',
			path: '2',
			responseCode: '3',
			responseTime: '4',
			headers: { foo: 'bar' },
			logTraceId: 'asdf123'
		}).once();
		requestLogger.transport({ headers: { foo: 'bar' }, logTraceId: 'asdf123' }, 'mystring', ['0', '1', '2', '3', '4', '5']);
	});
});
