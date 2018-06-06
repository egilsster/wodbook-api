const HttpStatus = require('http-status-codes');
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

		it('should return array of express errors if the error contains a truthy errors property', () => {
			const manyErrors = {
				'errors': {
					'key1': {
						'name': 'errName1',
						'message': 'errMessage1',
						'$isValidatorError': true
					},
					'key2': {
						'name': 'errName2',
						'message': 'errMessage2',
						'$isValidatorError': false
					}
				}
			};
			const res = ErrorUtils.ensureExpressError(manyErrors);
			expect(res).toHaveProperty('length', 2);
			expect(res[0]).toBeInstanceOf(ExpressError);
			expect(res[1]).toBeInstanceOf(ExpressError);
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

	describe('convertMongooseErrorToExpressErrors', () => {
		it('should convert mongoose errors to list of ExpressError', () => {
			const mongooseErrors = {
				'errors': {
					'key1': {
						'name': 'errName1',
						'message': 'errMessage1',
						'$isValidatorError': true
					},
					'key2': {
						'name': 'errName2',
						'message': 'errMessage2',
						'$isValidatorError': false
					}
				}
			};

			const res = ErrorUtils.convertMongooseErrorToExpressErrors(mongooseErrors);
			expect(res).toBeDefined();
			expect(res.length).toEqual(2);
			expect(res[0].detail).toEqual(mongooseErrors.errors.key1.message);
			expect(res[0].status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
			expect(res[1].detail).toEqual(mongooseErrors.errors.key2.message);
			expect(res[1].status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
		});
	});

	describe('guessStatusCode', () => {
		it('should return 422 Unprocessable Entity if error is a ValidatorError', () => {
			const err = {
				'$isValidatorError': true
			};

			const res = ErrorUtils.guessStatusCode(err);
			expect(res).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 500 Server Error if the status code could not be determined', () => {
			const err = new Error('msg');

			const res = ErrorUtils.guessStatusCode(err);
			expect(res).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
		});
	});

	describe('isExpressError', () => {
		it('should return true if an error is an ExpressError instance', () => {
			const exprErr = new ExpressError('msg', HttpStatus.ACCEPTED);
			const res = ErrorUtils.isExpressError(exprErr);
			expect(res).toBe(true);
		});

		it('should return true if an error is an array of ExpressError instances', () => {
			const exprErr = new ExpressError('msg', HttpStatus.ACCEPTED);
			const res = ErrorUtils.isExpressError([exprErr]);
			expect(res).toBe(true);
		});

		it('should return false if an error is a regular error', () => {
			const err = new Error('msg');
			const res = ErrorUtils.isExpressError(err);
			expect(res).toBe(false);
		});

		it('should return false if the error is a regular object', () => {
			const err = { name: 'test' };
			const res = ErrorUtils.isExpressError(err);
			expect(res).toBe(false);
		});
	});

	describe('isErrorWithErrors', () => {
		it('should return true if error object has a truthy errors property', () => {
			const err = { errors: [] };
			const res = ErrorUtils.isErrorWithErrors(err);
			expect(res).toBe(true);
		});

		it('should return false if error object has a falsy errors property', () => {
			const err = { errors: null };
			const res = ErrorUtils.isErrorWithErrors(err);
			expect(res).toBe(false);
		});

		it('should return false if error object does not have an errors property', () => {
			const err = {};
			const res = ErrorUtils.isErrorWithErrors(err);
			expect(res).toBe(false);
		});

		it('should return false if error object is falsy', () => {
			const err = null;
			const res = ErrorUtils.isErrorWithErrors(err);
			expect(res).toBe(false);
		});
	});
});
