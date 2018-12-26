import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { ErrorUtils } from '../../src/utils/error.utils';
import { ServiceError } from '../../src/utils/service.error';
import { ERROR_TEMPLATES } from '../../src/utils/error.templates';

describe('ErrorUtils', () => {
	ErrorUtils.logger = {
		info: () => { },
		warning: () => { },
		error: () => { }
	} as any;

	describe('ensureServiceError', () => {
		it('should return ServiceError as is', () => {
			const svcErr = new ServiceError(ERROR_TEMPLATES.INVALID_JWT);
			const res = ErrorUtils.ensureServiceError(svcErr);
			expect(res).toEqual(svcErr);
		});

		it('should convert Mongo error if error has a truthy code property', () => {
			const err = { name: 'MongoError', code: 11000 };
			const res = ErrorUtils.ensureServiceError(err);
			expect(res).toHaveProperty('status', HttpStatus.CONFLICT);
			expect(res).toBeInstanceOf(ServiceError);
		});

		it('should use default text and code if error is falsy', () => {
			const res = ErrorUtils.ensureServiceError(null);
			expect(res).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
			const meta = JSON.stringify(_.get(res, 'meta', {}));
			expect(meta).toMatch(/Unknown error was raised/);
			expect(res).toBeInstanceOf(ServiceError);
		});

		it('should handle type error', () => {
			const res = ErrorUtils.ensureServiceError(new TypeError());
			expect(res).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
			const meta = JSON.stringify(_.get(res, 'meta', {}));
			expect(meta).toMatch(/Unknown error was raised/);
			expect(res).toBeInstanceOf(ServiceError);
		});
	});

	describe('convertMongoErrorToServiceError', () => {
		it('should convert MongoError with code 11000 to ServiceError with status 409 Conflict', () => {
			const err = { name: 'MongoError', code: 11000 };
			const res = ErrorUtils.convertMongoErrorToServiceError(err);
			expect(res).toHaveProperty('status', HttpStatus.CONFLICT);
		});

		it('should convert MongoError with code 11001 to ServiceError with status 409 Conflict', () => {
			const err = { name: 'MongoError', code: 11001 };
			const res = ErrorUtils.convertMongoErrorToServiceError(err);
			expect(res).toHaveProperty('status', HttpStatus.CONFLICT);
		});

		it('should convert MongoError with code 17280 to ServiceError with status 422 Unprocessable Entity', () => {
			const err = { name: 'MongoError', code: 17280 };
			const res = ErrorUtils.convertMongoErrorToServiceError(err);
			expect(res).toHaveProperty('status', HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should create ServiceError with information from the MongoError in cases that are not known', () => {
			const err = { name: 'MongoError', message: 'test' };
			const res = ErrorUtils.convertMongoErrorToServiceError(err);
			expect(res).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
			const meta = JSON.stringify(_.get(res, 'meta', {}));
			expect(meta).toMatch(/Unknown Mongo error was raised/);
		});
	});
});
