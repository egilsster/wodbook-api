import * as sinon from 'sinon';
import * as winston from 'winston';
import * as _ from 'lodash';
import * as cls from 'continuation-local-storage';
import { Logger } from '../../../src/utils/logger/logger';
const session = cls.createNamespace('logger');

describe('Logger', () => {
	let logger, transport, winstonInstance;

	beforeEach(() => {
		transport = new winston.transports.Memory({
			json: true,
			stringify: true,
			level: 'info'
		});
		winstonInstance = new winston.Logger({ transports: [transport], levels: Logger.LOG_LEVELS });
		logger = new Logger('logger:tests', {
			winstonLogger: winstonInstance
		});
		delete process.env.LOG_LEVEL;
	});

	afterEach(() => {
		transport.errorOutput.length = 0;
		transport.writeOutput.length = 0;
		Logger._resetLogger();
		delete process.env.LOG_LEVEL;
	});

	describe('getWinstonLogger', () => {
		it('caches logger', () => {
			const first = Logger.getWinstonLogger();
			const second = Logger.getWinstonLogger();
			expect(first).toEqual(second);
		});

		it('sets log level to info by default', () => {
			const l = Logger.getWinstonLogger().transports.console.level;
			expect(l).toEqual('info');
		});

		it('overrides level with setting from LOG_LEVEL', () => {
			process.env.NODE_ENV = 'development';
			process.env.LOG_LEVEL = 'warn';
			const l = Logger.getWinstonLogger().transports.console.level;
			expect(l).toEqual('warn');
		});
	});

	describe('constructor', () => {
		it('sets default context', () => {
			const l = new Logger('themodule', {
				winstonLogger: new (winston.Logger)({ transports: [transport] })
			});
			delete l.defaultContext.pid;
			expect(l.defaultContext).toEqual({
				module: 'themodule',
				type: 'wodbook-api'
			});
		});

		it('merges added context into default context', () => {
			const l = new Logger('themodule', {
				winstonLogger: new (winston.Logger)({ transports: [transport] }),
				context: {
					foo: 'foo'
				}
			});
			delete l.defaultContext.pid;
			expect(l.defaultContext).toEqual({
				module: 'themodule',
				foo: 'foo',
				type: 'wodbook-api'
			});
		});

		it('overwrites default context values with provided values', () => {
			const l = new Logger('themodule', {
				winstonLogger: new (winston.Logger)({ transports: [transport] }),
				context: {
					module: 'someotherthing'
				}
			});
			delete l.defaultContext.pid;
			expect(l.defaultContext).toEqual({
				module: 'someotherthing',
				type: 'wodbook-api'
			});
		});
	});

	describe('_createContext', () => {
		it('returns default context given null request', () => {
			const context = logger._createContext(null);
			expect(context).toEqual({});
		});

		it('returns augmented context given correct request', () => {
			const req = {
				url: '/some/random/url',
				query: {
					feature: 'foo'
				},
				method: 'PATCH'
			};
			const context = logger._createContext(req);
			expect(context).toEqual({
				url: '/some/random/url',
				method: 'PATCH',
				query: [
					['feature', 'foo']
				],
				userId: undefined
			});
		});

		it('returns userId when it is provided in the request in req.user.id', () => {
			const req = {
				url: '/some/random/url',
				query: {
					feature: 'foo'
				},
				method: 'PATCH',
				user: { id: '1234' }
			};
			const context = logger._createContext(req);
			expect(context).toEqual({
				url: '/some/random/url',
				method: 'PATCH',
				query: [
					['feature', 'foo']
				],
				userId: '1234'
			});
		});

		it('drops query entries where the values are empty', () => {
			const req = {
				url: '/some/random/url',
				query: {
					feature: 'foo',
					bogus: '',
					alsobogus: null
				},
				method: 'PATCH',
				user: { id: '1234' }
			};
			const context = logger._createContext(req);
			expect(context).toEqual({
				url: '/some/random/url',
				method: 'PATCH',
				query: [
					['feature', 'foo']
				],
				userId: '1234'
			});
		});

		it('correctly handles multi-value query params', () => {
			const req = {
				url: '/some/random/url',
				query: {
					feature: ['foo', 'bar']
				},
				method: 'PATCH',
				user: { id: '1234' }
			};
			const context = logger._createContext(req);
			expect(context).toEqual({
				url: '/some/random/url',
				method: 'PATCH',
				query: [
					['feature', ['foo', 'bar']]
				],
				userId: '1234'
			});
		});
	});

	describe('_defaultRequestFilter', () => {
		let req;
		beforeEach(() => {
			req = {
				foo: 'bar',
				status: '200',
				method: 'GET',
				path: '/v1/foo/fooid123/bar/barid123',
				params: {
					fooId: 'fooid123',
					barId: 'barid123'
				}
			};
		});

		it('returns property from the request', () => {
			const property = Logger._defaultRequestFilter(req, 'foo');
			expect(property).toEqual('bar');
		});

		it('returns formatted property when propName is endpoint', () => {
			const property = Logger._defaultRequestFilter(req, 'endpoint');
			expect(property).toEqual('GET /v1/foo/{fooId}/bar/{barId}');
		});
	});

	describe('_defaultIgnoreRoute', () => {
		let req;

		beforeEach(() => {
			req = {};
		});

		it('returns false when url does not match /health or /metrics', () => {
			req.url = '/bar';
			const ignoreRoute = Logger._defaultIgnoreRoute(req);
			expect(ignoreRoute).toBe(false);
		});

		it('returns true when url matches /health', () => {
			req.url = '/health';
			const ignoreRoute = Logger._defaultIgnoreRoute(req);
			expect(ignoreRoute).toBe(true);
		});

		it('returns true when url matches /metrics', () => {
			req.url = '/metrics';
			const ignoreRoute = Logger._defaultIgnoreRoute(req);
			expect(ignoreRoute).toBe(true);
		});
	});

	describe('log functions', () => {
		_.each(['trace', 'debug', 'verbose', 'info', 'warn', 'error', 'fatal'], function (level) {
			it(`${level} level with message and messageContext`, function (done) {
				const req = {
					user: {
						id: '123'
					},
					url: '/foo/bar/baz',
					query: {
						bogus: '',
						filter: 'blah'
					}
				};
				const context = {
					username: 'foo',
					url: '/foo/bar/baz'
				};
				const message = 'hello world!';
				const messageContext = {
					userId: '1234',
					appId: '456',
					query: {
						bogus: '',
						filter: 'blah'
					}
				};
				session.run(() => {
					session.set('req', req);
					logger[level](message, messageContext);
					const output = transport.writeOutput[0] || transport.errorOutput[0];
					if (!output) {
						return done();
					}
					const msg = JSON.parse(output);
					delete msg.pid;
					expect(msg).toEqual({
						level,
						logseverity: level.toUpperCase(),
						message,
						userId: messageContext.userId,
						appId: messageContext.appId,
						url: context.url,
						module: 'logger:tests',
						query: [['filter', 'blah']],
						type: 'wodbook-api'
					});
					done();
				});
			});

			it(`${level} level with message only`, function (done) {
				const req = {
					user: {
						id: '1234'
					},
					url: '/foo/bar/baz',
					query: []
				};
				const context = {
					username: 'foo',
					url: '/foo/bar/baz'
				};
				const message = 'hello world!';
				session.run(() => {
					session.set('req', req);
					logger[level](message);
					const output = transport.writeOutput[0] || transport.errorOutput[0];
					if (!output) {
						return done();
					}
					const msg = JSON.parse(output);
					delete msg.pid;
					expect(msg).toEqual({
						level,
						logseverity: level.toUpperCase(),
						message,
						url: context.url,
						module: 'logger:tests',
						userId: req.user.id,
						query: [],
						type: 'wodbook-api'
					});
					done();
				});
			});

			it(`${level} level with messageContext`, function (done) {
				const req = {
					user: {
						id: '1234'
					},
					url: '/foo/bar/baz',
					query: []
				};
				const context = {
					username: 'foo',
					url: '/foo/bar/baz'
				};
				const messageContext = {
					userId: '123',
					appId: '456'
				};
				session.run(() => {
					session.set('req', req);
					logger[level](messageContext);
					const output = transport.writeOutput[0] || transport.errorOutput[0];
					if (!output) {
						return done();
					}
					const msg = JSON.parse(output);
					delete msg.pid;
					expect(msg).toEqual({
						level,
						logseverity: level.toUpperCase(),
						message: '',
						userId: messageContext.userId,
						appId: messageContext.appId,
						url: context.url,
						module: 'logger:tests',
						query: [],
						type: 'wodbook-api'
					});
					done();
				});
			});

			it(`${level} level with format string`, function (done) {
				const req = {
					user: {
						id: '123'
					},
					url: '/foo/bar/baz',
					query: []
				};
				const context = {
					url: '/foo/bar/baz'
				};
				session.run(() => {
					session.set('req', req);
					logger[level]('%s, %s', 'Hello', 'world!');
					const output = transport.writeOutput[0] || transport.errorOutput[0];
					if (!output) {
						return done();
					}
					const msg = JSON.parse(output);
					delete msg.pid;
					expect(msg).toEqual({
						level,
						logseverity: level.toUpperCase(),
						message: 'Hello, world!',
						url: context.url,
						module: 'logger:tests',
						userId: req.user.id,
						query: [],
						type: 'wodbook-api'
					});
					done();
				});
			});

			it(`${level} level with format string and messageContext`, function (done) {
				const req = {
					user: {
						id: '1234'
					},
					url: '/foo/bar/baz',
					query: []
				};
				const context = {
					username: 'foo',
					url: '/foo/bar/baz'
				};
				const messageContext = {
					userId: '123',
					appId: '456'
				};
				session.run(() => {
					session.set('req', req);
					logger[level]('%s, %s', 'Hello', 'world!', messageContext);
					const output = transport.writeOutput[0] || transport.errorOutput[0];
					if (!output) {
						return done();
					}
					const msg = JSON.parse(output);
					delete msg.pid;
					expect(msg).toEqual({
						level,
						logseverity: level.toUpperCase(),
						message: 'Hello, world!',
						userId: messageContext.userId,
						appId: messageContext.appId,
						url: context.url,
						module: 'logger:tests',
						query: [],
						type: 'wodbook-api'
					});
					done();
				});
			});

			it(`${level} level with errors`, function (done) {
				const req = {
					user: {
						id: '123'
					},
					url: '/foo/bar/baz',
					query: []
				};
				const context = {
					username: 'foo',
					url: '/foo/bar/baz'
				};
				const error = new Error('THE SKY IS FALLING');
				session.run(() => {
					session.set('req', req);
					logger[level](error);
					const output = transport.writeOutput[0] || transport.errorOutput[0];
					if (!output) {
						return done();
					}
					const msg = JSON.parse(output);
					delete msg.pid;
					expect(msg).toHaveProperty('level', level);
					expect(msg).toHaveProperty('logseverity', level.toUpperCase());
					expect(msg).toHaveProperty('message');
					expect(msg.message).toMatch(/^Error: THE SKY IS FALLING.*/);
					expect(msg).toHaveProperty('url', context.url);
					expect(msg).toHaveProperty('module', 'logger:tests');
					expect(msg).toHaveProperty('query', []);
					expect(msg).toHaveProperty('userId', req.user.id);
					expect(msg).toHaveProperty('type', 'wodbook-api');
					done();
				});
			});

			it(`${level} level with errors, messages and contexts`, function (done) {
				const req = {
					user: {
						id: '123'
					},
					url: '/foo/bar/baz',
					query: []
				};
				const context = {
					url: '/foo/bar/baz'
				};
				const messageContext = {
					userId: '1234',
					appId: '456'
				};
				const error = new Error('THE SKY IS FALLING');
				session.run(() => {
					session.set('req', req);
					logger[level]('Oh look what happened:', error, messageContext);
					const output = transport.writeOutput[0] || transport.errorOutput[0];
					if (!output) {
						return done();
					}
					const msg = JSON.parse(output);
					delete msg.pid;
					expect(msg).toHaveProperty('level', level);
					expect(msg).toHaveProperty('logseverity', level.toUpperCase());
					expect(msg).toHaveProperty('message');
					expect(msg.message).toMatch(/^Oh look what happened: Error: THE SKY IS FALLING.*/);
					expect(msg).toHaveProperty('appId', messageContext.appId);
					expect(msg).toHaveProperty('userId', messageContext.userId);
					expect(msg).toHaveProperty('url', context.url);
					expect(msg).toHaveProperty('module', 'logger:tests');
					done();
				});
			});

			it(`${level} level with promise`, function (done) {
				const req = {
					user: {
						id: '123'
					},
					url: '/foo/bar/baz',
					query: []
				};
				const context = {
					username: 'foo',
					url: '/foo/bar/baz'
				};
				const messageContext = {
					appId: '456'
				};
				const error = new Error('THE SKY IS FALLING');
				session.run(() => {
					session.set('req', req);
					return new Promise(() => {
						logger[level]('Oh look what happened:', error, messageContext);
						const output = transport.writeOutput[0] || transport.errorOutput[0];
						if (!output) {
							done();
						}
						const msg = JSON.parse(output);
						delete msg.pid;
						expect(msg).toHaveProperty('level', level);
						expect(msg).toHaveProperty('logseverity', level.toUpperCase());
						expect(msg).toHaveProperty('message');
						expect(msg.message).toMatch(/^Oh look what happened: Error: THE SKY IS FALLING.*/);
						expect(msg).toHaveProperty('appId', messageContext.appId);
						expect(msg).toHaveProperty('url', context.url);
						expect(msg).toHaveProperty('module', 'logger:tests');
						expect(msg).toHaveProperty('query', []);
						expect(msg).toHaveProperty('userId', req.user.id);
						done();
					});
				});
			});

			it(`${level} with log message template, params and msgContext`, function (done) {
				const req = {
					user: {
						username: 'foo'
					},
					url: '/foo/bar/baz',
					query: []
				};
				const context = {
					username: 'foo',
					url: '/foo/bar/baz'
				};
				const messageContext = {
					userId: '123',
					appId: '456'
				};
				const msgStruct = {
					code: 'SERVICE-123',
					template: 'The first param is ${first} and the second is ${second}' // tslint:disable-line
				};

				session.run(() => {
					session.set('req', req);
					logger[level](msgStruct, { first: 'one', second: 'two', extra: 'this is extra!' }, messageContext);
					const output = transport.writeOutput[0] || transport.errorOutput[0];
					if (!output) {
						return done();
					}
					const msg = JSON.parse(output);
					delete msg.pid;
					expect(msg).toMatchObject({
						level,
						logseverity: level.toUpperCase(),
						message: 'The first param is one and the second is two',
						appId: messageContext.appId,
						userId: messageContext.userId,
						url: context.url,
						module: 'logger:tests',
						query: [],
						first: 'one',
						second: 'two',
						extra: 'this is extra!'
					});
					done();
				});
			});

			it(`${level} with log message template and params`, function (done) {
				const req = {
					user: {
						username: 'foo'
					},
					url: '/foo/bar/baz',
					query: []
				};
				const context = {
					username: 'foo',
					url: '/foo/bar/baz'
				};
				const msgStruct = {
					code: 'SERVICE-123',
					template: 'The first param is ${first} and the second is ${second}' // tslint:disable-line
				};

				session.run(() => {
					session.set('req', req);
					logger[level](msgStruct, { first: 'one', second: 'two', extra: 'this is extra!' });
					const output = transport.writeOutput[0] || transport.errorOutput[0];
					if (!output) {
						return done();
					}
					const msg = JSON.parse(output);
					delete msg.pid;
					expect(msg).toMatchObject({
						level,
						logseverity: level.toUpperCase(),
						message: 'The first param is one and the second is two',
						url: context.url,
						module: 'logger:tests',
						query: [],
						first: 'one',
						second: 'two',
						extra: 'this is extra!'
					});
					done();
				});
			});

			it(`${level} with log message template`, function (done) {
				const req = {
					user: {
						username: 'foo'
					},
					url: '/foo/bar/baz',
					query: []
				};
				const context = {
					username: 'foo',
					url: '/foo/bar/baz'
				};
				const messageContext = {
					userId: '123',
					appId: '456'
				};
				const msgStruct = {
					code: 'SERVICE-123',
					template: 'A message with no params' // eslint-disable-line no-template-curly-in-string
				};

				session.run(() => {
					session.set('req', req);
					logger[level](msgStruct, { first: 'one', second: 'two', extra: 'this is extra!' }, messageContext);
					const output = transport.writeOutput[0] || transport.errorOutput[0];
					if (!output) {
						return done();
					}
					const msg = JSON.parse(output);
					delete msg.pid;
					expect(msg).toMatchObject({
						level,
						logseverity: level.toUpperCase(),
						message: 'A message with no params',
						url: context.url,
						module: 'logger:tests',
						query: []
					});
					done();
				});
			});
		});
	});
});
