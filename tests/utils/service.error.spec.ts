import * as HttpStatus from 'http-status-codes';
import { ServiceError } from '../../src/utils/service.error';
import { ERROR_TEMPLATES } from '../../src/utils/error.templates';

describe('ServiceError', () => {
	it('should create an instance with an error template', () => {
		const err = new ServiceError(ERROR_TEMPLATES.CONFLICT);
		expect(err).toHaveProperty('title', 'Conflict');
		expect(err).toHaveProperty('status', HttpStatus.CONFLICT);
	});

	it('should add options to error when passed in', () => {
		const options = { source: { pointer: '/name' } };
		const err = new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, options);
		expect(err).toHaveProperty('title', 'Invalid property value');
		expect(err).toHaveProperty('status', HttpStatus.UNPROCESSABLE_ENTITY);
		expect(err).toHaveProperty('source', options.source);
	});
});
