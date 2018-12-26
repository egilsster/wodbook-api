import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { ERROR_TEMPLATES } from '../../src/utils/error.templates';
import { ErrorHandler } from '../../src/middleware/error.handler';
import { ServiceError } from '../../src/utils/service.error';
import { ErrorUtils } from '../../src/utils/error.utils';

describe('ErrorHandler', () => {
	let ctx;
	let errorHandler;
	let _errorUtils: sinon.SinonMock;

	beforeEach(() => {
		ctx = {};
		errorHandler = new ErrorHandler();
		_errorUtils = sinon.mock(ErrorUtils);
	});

	afterEach(() => {
		_errorUtils.verify();
	});

	it('should convert thrown error to service error', async () => {
		const err = new Error('Error');
		const serviceErr = new ServiceError(ERROR_TEMPLATES.NOT_FOUND);
		const next = sinon.stub().throws(err);
		_errorUtils.expects('ensureServiceError').withExactArgs(err).returns(serviceErr);

		await errorHandler.handle(ctx, next);

		expect(ctx.body).toEqual(serviceErr);
		expect(ctx.status).toEqual(HttpStatus.NOT_FOUND);
	});

	it('should add itself to the app', (done) => {
		errorHandler.init({
			use: (middleware) => {
				expect(middleware).toBeDefined();
				done();
			}
		});
	});

	describe('statusCodeInjector', () => {
		let handler;
		beforeEach(() => {
			errorHandler.statusCodeInjector().init({
				use(middleware) {
					handler = middleware;
				}
			});
		});

		async function statusResolvesTo(status, expected) {
			let err = new ServiceError(ERROR_TEMPLATES.NOT_FOUND);
			err.status = status;
			try {
				await handler(ctx, async () => { throw err; });
				expect(false).toBe(true); // error should have been thrown'
			} catch (thrown) {
				expect(thrown).toEqual(err);
			}

			expect(ctx.status).toEqual(expected);
		}
		_.forEach([
			[504, 504],
			['504', 504],
			['hey oh', 500],
			[true, 500],
			[{ one: 1 }, 500],
			[-1, 500],
			[99, 500],
			[599, 599],
			[600, 500],
			[undefined, 500],
			[null, 500]

		], ([val, expected]) => {
			it(`${val} -> ${expected}`, async () => {
				await statusResolvesTo(val, expected);
			});
		});

		it('Falls back to 500 when error has no status', async () => {
			let err = new Error();
			try {
				await handler(ctx, async () => { throw err; });
				expect(false).toBe(true); // error should have been thrown'
			} catch (thrown) {
				expect(thrown).toEqual(err);
			}
			expect(ctx.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
		});
	});
});
