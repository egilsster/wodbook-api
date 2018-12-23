import * as HttpStatus from 'http-status-codes';
import { ErrorUtils } from '../../src/utils/error.utils';
import { ExpressError } from '../../src/utils/express.error';
import { Error } from 'mongoose';

describe('ErrorUtils', () => {
	describe('ensureExpressError', () => {
		it('should return ExpressError as is', () => {
			const exprErr = new ExpressError('msg', HttpStatus.IM_A_TEAPOT);
			const res = ErrorUtils.ensureExpressError(exprErr);
			expect(res).toEqual(exprErr);
		});

		it('should convert validation errors', () => {
			const manyErrors = {
				errors: {
					key1: {
						name: 'ValidatorError',
						message: 'errMessage1'
					},
					key2: {
						name: 'ValidationError',
						message: 'errMessage2'
					},
					key3: {
						name: 'OtherError',
						message: 'errMessage3'
					}
				}
			};
			const res = ErrorUtils.ensureExpressError(manyErrors);
			expect(res).toBeInstanceOf(ExpressError);
			expect(res.detail).toContain(manyErrors.errors.key1.message);
			expect(res.detail).toContain(manyErrors.errors.key2.message);
			expect(res.detail).toContain(manyErrors.errors.key3.message);
		});

		it('should convert Mongo error if error has a truthy code property', () => {
			const err = { name: 'MongoError', code: 11000 };
			const res = ErrorUtils.ensureExpressError(err);
			expect(res).toHaveProperty('status', HttpStatus.CONFLICT);
			expect(res).toBeInstanceOf(ExpressError);
		});

		it('should use information from the error if cases are not known', () => {
			const err = { message: 'test', status: HttpStatus.BAD_REQUEST };
			const res = ErrorUtils.ensureExpressError(err);
			expect(res).toHaveProperty('detail', err.message);
			expect(res).toHaveProperty('status', HttpStatus.BAD_REQUEST);
			expect(res).toBeInstanceOf(ExpressError);
		});

		it('should use default text and code if error is falsy', () => {
			const res = ErrorUtils.ensureExpressError(null);
			expect(res).toHaveProperty('detail', 'Unknown error occurred');
			expect(res).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
			expect(res).toBeInstanceOf(ExpressError);
		});
	});

	describe('convertMongoErrorToExpressError', () => {
		it('should convert MongoError with code 11000 to ExpressError with status 409 Conflict', () => {
			const err = { name: 'MongoError', code: 11000 };
			const res = ErrorUtils.convertMongoErrorToExpressError(err);
			expect(res).toHaveProperty('status', HttpStatus.CONFLICT);
		});

		it('should convert MongoError with code 11001 to ExpressError with status 409 Conflict', () => {
			const err = { name: 'MongoError', code: 11001 };
			const res = ErrorUtils.convertMongoErrorToExpressError(err);
			expect(res).toHaveProperty('status', HttpStatus.CONFLICT);
		});

		it('should convert MongoError with code 17280 to ExpressError with status 422 Unprocessable Entity', () => {
			const err = { name: 'MongoError', code: 17280 };
			const res = ErrorUtils.convertMongoErrorToExpressError(err);
			expect(res).toHaveProperty('status', HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should create ExpressError with information from the MongoError in cases that are not known', () => {
			const err = { name: 'MongoError', message: 'test' };
			const res = ErrorUtils.convertMongoErrorToExpressError(err);
			expect(res).toHaveProperty('detail', err.message);
			expect(res).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
		});

		it('should create ExpressError with default text and 500 Server Error code if nothing can be extracted from the error', () => {
			const err = { name: 'MongoError' };
			const res = ErrorUtils.convertMongoErrorToExpressError(err);
			expect(res).toHaveProperty('detail', 'Unknown Mongo error occurred');
			expect(res).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
		});
	});

	describe('convertMongooseErrorToExpressError', () => {
		it('should convert mongoose errors to an ExpressError', () => {
			const mongooseErrors = {
				name: 'ValidationError',
				errors: {
					key1: {
						name: 'ValidatorError',
						message: 'errMessage1'
					},
					key2: {
						name: 'OtherError',
						message: 'errMessage2'
					}
				}
			};

			const res = ErrorUtils.convertMongooseErrorToExpressError(mongooseErrors);
			expect(res.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
			expect(res.detail).toContain(mongooseErrors.errors.key1.message);
			expect(res.detail).toContain(mongooseErrors.errors.key2.message);
		});
	});

	describe('guessStatusCode', () => {
		it('should return 422 Unprocessable Entity if error is a ValidatorError', () => {
			const res = ErrorUtils.guessStatusCode({ name: 'ValidatorError' });
			expect(res).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 422 Unprocessable Entity if error is a ValidationError', () => {
			const res = ErrorUtils.guessStatusCode({ name: 'ValidationError' });
			expect(res).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 500 Server Error if the status code could not be determined', () => {
			const res = ErrorUtils.guessStatusCode(new Error('msg'));
			expect(res).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
		});
	});
});
