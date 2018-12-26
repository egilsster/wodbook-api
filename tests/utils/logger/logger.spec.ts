import { Logger } from '../../../src/utils/logger/logger';
import * as winston from 'winston';
import * as _ from 'lodash';
import * as cls from 'cls-hooked';

let session = cls.createNamespace('logger');

describe('Logger', function () {
	let logger, transport, winstonInstance;

	beforeEach(function () {
		Logger.setContext({});
		transport = new winston.transports.Memory({
			json: true,
			stringify: true,
			level: 'info'
		});
		winstonInstance = new winston.Logger({
			transports: [transport],
			levels: Logger.LOG_LEVELS
		});
		logger = new Logger('logger:tests', {
			winstonLogger: winstonInstance
		});
		delete process.env.LOG_LEVEL;
	});

	afterEach(function () {
		transport.errorOutput.length = 0;
		transport.writeOutput.length = 0;
		Logger.setContext({});
		Logger._resetLogger();
		delete process.env.LOG_LEVEL;
	});

	describe('getWinstonLogger', function () {
		it('caches logger', function () {
			let first = Logger.getWinstonLogger();
			let second = Logger.getWinstonLogger();
			expect(first).toEqual(second);
		});

		it('sets log level to info by default', function () {
			let l = Logger.getWinstonLogger().transports.console.level;
			expect(l).toEqual('info');
		});

		it('overrides level with setting from LOG_LEVEL', function () {
			process.env.LOG_LEVEL = 'warn';
			let l = Logger.getWinstonLogger().transports.console.level;
			expect(l).toEqual('warn');
		});
		it('lowercases value from LOG_LEVEL', function () {
			process.env.LOG_LEVEL = 'WARN';
			let l = Logger.getWinstonLogger().transports.console.level;
			expect(l).toEqual('warn');
		});
	});

	describe('addContext', function () {
		it('alters default context', function () {
			Logger.addContext({
				version: '123'
			});
			let l = new Logger();
			delete l.defaultContext.pid;
			expect(l.defaultContext).toEqual({
				version: '123'
			});
		});
	});

	describe('constructor', function () {
		it('sets default context', function () {
			let l = new Logger('themodule', {
				winstonLogger: new winston.Logger({ transports: [transport] })
			});
			delete l.defaultContext.pid;
			expect(l.defaultContext).toEqual({
				module: 'themodule'
			});
		});

		it('merges added context into default context', function () {
			let l = new Logger('themodule', {
				winstonLogger: new winston.Logger({ transports: [transport] }),
				context: {
					foo: 'foo'
				}
			});
			delete l.defaultContext.pid;
			expect(l.defaultContext).toEqual({
				module: 'themodule',
				foo: 'foo'
			});
		});

		it('overwrites default context values with provided values', function () {
			let l = new Logger('themodule', {
				winstonLogger: new winston.Logger({ transports: [transport] }),
				context: {
					module: 'someotherthing'
				}
			});
			delete l.defaultContext.pid;
			expect(l.defaultContext).toEqual({
				module: 'someotherthing'
			});
		});
	});

	describe('_createContext', function () {
		it('returns default context given null request', function () {
			let context = logger._createContext(null);
			expect(context).toEqual({});
		});
		it('returns augmented context given correct request', function () {
			let req = {
				id: 'abcd1234',
				ip: '1.2.3.4',
				url: '/some/random/url',
				query: {
					feature: 'foo'
				},
				method: 'PATCH'
			};
			let context = logger._createContext(req);
			expect(context).toEqual({
				id: 'abcd1234',
				ip: '1.2.3.4',
				url: '/some/random/url',
				method: 'PATCH',
				query: [['feature', 'foo']],
				userId: undefined
			});
		});
		it('returns userId when it is provided in the request in req.user.id', function () {
			let req = {
				id: 'abcd1234',
				ip: '1.2.3.4',
				url: '/some/random/url',
				query: {
					feature: 'foo'
				},
				method: 'PATCH',
				user: { id: '1234' }
			};
			let context = logger._createContext(req);
			expect(context).toEqual({
				id: 'abcd1234',
				ip: '1.2.3.4',
				url: '/some/random/url',
				method: 'PATCH',
				query: [['feature', 'foo']],
				userId: '1234'
			});
		});
		it('drops query entries where the values are empty', function () {
			let req = {
				id: 'abcd1234',
				ip: '1.2.3.4',
				url: '/some/random/url',
				query: {
					feature: 'foo',
					bogus: '',
					alsobogus: null
				},
				method: 'PATCH',
				user: { id: '1234' }
			};
			let context = logger._createContext(req);
			expect(context).toEqual({
				id: 'abcd1234',
				ip: '1.2.3.4',
				url: '/some/random/url',
				method: 'PATCH',
				query: [['feature', 'foo']],
				userId: '1234'
			});
		});
		it('correctly handles multi-value query params', function () {
			let req = {
				id: 'abcd1234',
				ip: '1.2.3.4',
				url: '/some/random/url',
				query: {
					feature: ['foo', 'bar']
				},
				method: 'PATCH',
				user: { id: '1234' }
			};
			let context = logger._createContext(req);
			expect(context).toEqual({
				id: 'abcd1234',
				ip: '1.2.3.4',
				url: '/some/random/url',
				method: 'PATCH',
				query: [['feature', ['foo', 'bar']]],
				userId: '1234'
			});
		});
	});

	describe('computeContext', function () {
		it('calls context transform function when added', function () {
			try {
				let req = {
					id: 'abcd1234',
					ip: '1.2.3.4',
					url: '/some/random/url',
					query: {
						feature: 'foo'
					},
					method: 'PATCH',
					user: { id: '1234' }
				};
				Logger.setContextTransform((logContext, _reqContext) => {
					logContext.url = `${logContext.url}#FOOBAR`;
					logContext.testToken123 = 'testToken123';
					return logContext;
				});
				let context = logger._createContext(req);
				context = logger.computeContext(context);

				// pid will change with each test execution, verify that it's present then remove
				expect(context.pid).toBeDefined();
				delete context.pid;

				expect(context).toEqual({
					module: 'logger:tests',
					id: 'abcd1234',
					ip: '1.2.3.4',
					url: '/some/random/url#FOOBAR',
					method: 'PATCH',
					query: [['feature', 'foo']],
					userId: '1234',
					testToken123: 'testToken123'
				});
			} finally {
				// don't allow our custom transform to affect other tests, even if error thrown
				Logger.clearContextTransform();
			}
		});
	});

	describe.skip('log functions', function () {
		_.each(
			['trace', 'debug', 'verbose', 'info', 'warn', 'error', 'fatal'],
			function (level) {
				it(`${level} level with message and messageContext`, function (done) {
					let req = {
						user: {
							id: '123'
						},
						url: '/foo/bar/baz',
						query: {
							bogus: '',
							filter: 'blah'
						}
					};
					let context = {
						username: 'foo',
						url: '/foo/bar/baz'
					};
					let message = 'hello world!';
					let messageContext = {
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
						let output = transport.writeOutput[0] || transport.errorOutput[0];
						let msg = JSON.parse(output);
						delete msg.pid;
						expect(msg).toEqual({
							level,
							logseverity: level.toUpperCase(),
							message,
							userId: messageContext.userId,
							appId: messageContext.appId,
							url: context.url,
							module: 'logger:tests',
							query: [['filter', 'blah']]
						});
						done();
					});
				});
				it(`${level} level with message only`, function (done) {
					let req = {
						user: {
							id: '1234'
						},
						url: '/foo/bar/baz',
						query: []
					};
					let context = {
						username: 'foo',
						url: '/foo/bar/baz'
					};
					let message = 'hello world!';
					session.run(() => {
						session.set('req', req);
						logger[level](message);
						let output = transport.writeOutput[0] || transport.errorOutput[0];
						let msg = JSON.parse(output);
						delete msg.pid;
						expect(msg).toEqual({
							level,
							logseverity: level.toUpperCase(),
							message,
							url: context.url,
							module: 'logger:tests',
							query: [],
							userId: req.user.id
						});
						done();
					});
				});
				it(`${level} level with messageContext`, function (done) {
					let req = {
						user: {
							id: '1234'
						},
						url: '/foo/bar/baz',
						query: []
					};
					let context = {
						username: 'foo',
						url: '/foo/bar/baz'
					};
					let messageContext = {
						userId: '123',
						appId: '456'
					};
					session.run(() => {
						session.set('req', req);
						logger[level](messageContext);
						let output = transport.writeOutput[0] || transport.errorOutput[0];
						let msg = JSON.parse(output);
						delete msg.pid;
						expect(msg).toEqual({
							level,
							logseverity: level.toUpperCase(),
							message: 'undefined',
							userId: messageContext.userId,
							appId: messageContext.appId,
							url: context.url,
							module: 'logger:tests',
							query: []
						});
						done();
					});
				});
				it(`${level} level with format string`, function (done) {
					let req = {
						user: {
							id: '123'
						},
						url: '/foo/bar/baz',
						query: []
					};
					let context = {
						url: '/foo/bar/baz'
					};
					session.run(() => {
						session.set('req', req);
						logger[level]('%s, %s', 'Hello', 'world!');
						let output = transport.writeOutput[0] || transport.errorOutput[0];
						let msg = JSON.parse(output);
						delete msg.pid;
						expect(msg).toEqual({
							level,
							logseverity: level.toUpperCase(),
							message: 'Hello, world!',
							url: context.url,
							module: 'logger:tests',
							query: [],
							userId: req.user.id
						});
						done();
					});
				});
				it(`${level} level with format string and messageContext`, function (done) {
					let req = {
						user: {
							id: '1234'
						},
						url: '/foo/bar/baz',
						query: []
					};
					let context = {
						username: 'foo',
						url: '/foo/bar/baz'
					};
					let messageContext = {
						userId: '123',
						appId: '456'
					};
					session.run(() => {
						session.set('req', req);
						logger[level]('%s, %s', 'Hello', 'world!', messageContext);
						let output = transport.writeOutput[0] || transport.errorOutput[0];
						let msg = JSON.parse(output);
						delete msg.pid;
						expect(msg).toEqual({
							level,
							logseverity: level.toUpperCase(),
							message: 'Hello, world!',
							userId: messageContext.userId,
							appId: messageContext.appId,
							url: context.url,
							module: 'logger:tests',
							query: []
						});
						done();
					});
				});
				it(`${level} level with errors`, function (done) {
					let req = {
						user: {
							id: '123'
						},
						url: '/foo/bar/baz',
						query: []
					};
					let context = {
						username: 'foo',
						url: '/foo/bar/baz'
					};
					let error = new Error('THE SKY IS FALLING');
					session.run(() => {
						session.set('req', req);
						logger[level](error);
						let output = transport.writeOutput[0] || transport.errorOutput[0];
						let msg = JSON.parse(output);
						delete msg.pid;
						expect(msg).toMatchObject({
							level,
							logseverity: level.toUpperCase(),
							message: /^Error: THE SKY IS FALLING.*/,
							url: context.url,
							module: 'logger:tests',
							query: [],
							userId: req.user.id
						});
						done();
					});
				});
				it(`${level} level with errors, messages and contexts`, function (done) {
					let req = {
						user: {
							id: '123'
						},
						url: '/foo/bar/baz',
						query: []
					};
					let context = {
						url: '/foo/bar/baz'
					};
					let messageContext = {
						userId: '1234',
						appId: '456'
					};
					let error = new Error('THE SKY IS FALLING');
					session.run(() => {
						session.set('req', req);
						logger[level]('Oh look what happened:', error, messageContext);
						let output = transport.writeOutput[0] || transport.errorOutput[0];
						let msg = JSON.parse(output);
						delete msg.pid;
						expect(msg).toMatchObject({
							level,
							logseverity: level.toUpperCase(),
							message: /^Oh look what happened: Error: THE SKY IS FALLING.*/,
							appId: messageContext.appId,
							userId: messageContext.userId,
							url: context.url,
							module: 'logger:tests',
							query: []
						});
						done();
					});
				});
				it(`${level} level with promise`, function (done) {
					let req = {
						user: {
							id: '123'
						},
						url: '/foo/bar/baz',
						query: []
					};
					let context = {
						username: 'foo',
						url: '/foo/bar/baz'
					};
					let messageContext = {
						appId: '456'
					};
					let error = new Error('THE SKY IS FALLING');
					session.run(() => {
						session.set('req', req);
						return new Promise(() => {
							logger[level]('Oh look what happened:', error, messageContext);
							let output = transport.writeOutput[0] || transport.errorOutput[0];
							let msg = JSON.parse(output);
							delete msg.pid;
							expect(msg).toMatchObject({
								level,
								logseverity: level.toUpperCase(),
								message: /^Oh look what happened: Error: THE SKY IS FALLING.*/,
								appId: messageContext.appId,
								url: context.url,
								module: 'logger:tests',
								query: [],
								userId: req.user.id
							});
							done();
						});
					});
					it(`${level} with log message template, params and msgContext`, function (done) {
						let req = {
							user: {
								username: 'foo'
							},
							url: '/foo/bar/baz',
							query: []
						};
						let context = {
							username: 'foo',
							url: '/foo/bar/baz'
						};
						let messageContext = {
							userId: '123',
							appId: '456'
						};
						let msgStruct = {
							code: 'SERVICE-123',
							template:
								// tslint:disable-next-line:no-invalid-template-strings
								'The first param is ${first} and the second is ${second}'
						};

						session.run(() => {
							session.set('req', req);
							logger[level](
								msgStruct,
								{ first: 'one', second: 'two', extra: 'this is extra!' },
								messageContext
							);
							let output = transport.writeOutput[0] || transport.errorOutput[0];
							let msg = JSON.parse(output);
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
								user: {
									username: context.username
								},
								first: 'one',
								second: 'two',
								extra: 'this is extra!'
							});
							done();
						});
					});
					it(`${level} with log message template and params`, function (done) {
						let req = {
							user: {
								username: 'foo'
							},
							url: '/foo/bar/baz',
							query: []
						};
						let context = {
							username: 'foo',
							url: '/foo/bar/baz'
						};
						let msgStruct = {
							code: 'SERVICE-123',
							template:
								// tslint:disable-next-line:no-invalid-template-strings
								'The first param is ${first} and the second is ${second}'
						};

						session.run(() => {
							session.set('req', req);
							logger[level](msgStruct, {
								first: 'one',
								second: 'two',
								extra: 'this is extra!'
							});
							let output = transport.writeOutput[0] || transport.errorOutput[0];
							let msg = JSON.parse(output);
							delete msg.pid;
							expect(msg).toMatchObject({
								level,
								logseverity: level.toUpperCase(),
								message: 'The first param is one and the second is two',
								url: context.url,
								module: 'logger:tests',
								query: [],
								user: {
									username: context.username
								},
								first: 'one',
								second: 'two',
								extra: 'this is extra!'
							});
							done();
						});
					});
					it(`${level} with log message template`, function (done) {
						let req = {
							user: {
								username: 'foo'
							},
							url: '/foo/bar/baz',
							query: []
						};
						let context = {
							username: 'foo',
							url: '/foo/bar/baz'
						};
						let messageContext = {
							userId: '123',
							appId: '456'
						};
						let msgStruct = {
							code: 'SERVICE-123',
							template: 'A message with no params' // eslint-disable-line no-template-curly-in-string
						};

						session.run(() => {
							session.set('req', req);
							logger[level](
								msgStruct,
								{ first: 'one', second: 'two', extra: 'this is extra!' },
								messageContext
							);
							let output = transport.writeOutput[0] || transport.errorOutput[0];
							let msg = JSON.parse(output);
							delete msg.pid;
							expect(msg).toMatchObject({
								level,
								logseverity: level.toUpperCase(),
								message: 'A message with no params',
								url: context.url,
								module: 'logger:tests',
								query: [],
								user: {
									username: context.username
								}
							});
							done();
						});
					});
				});
			}
		);
	});
});
