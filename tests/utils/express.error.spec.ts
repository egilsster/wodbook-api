const HttpStatus = require('http-status-codes');
import { ExpressError } from '../../src/utils/express.error';

describe('ExpressError', () => {
	it('should create an instance with the text of the code as title', () => {
		const err = new ExpressError('detail', HttpStatus.CONFLICT);
		expect(err).toHaveProperty('title', '409 Conflict');
	});

	it('should create an instance with the text of the code as title', () => {
		const err = new ExpressError('detail', HttpStatus.NOT_FOUND);
		expect(err).toHaveProperty('title', '404 Not Found');
	});

	it('should create an instance with the text of the code as title', () => {
		const err = new ExpressError('detail', HttpStatus.OK);
		expect(err).toHaveProperty('title', '200 OK');
	});

	it('should create an instance with the text of the code as title', () => {
		const err = new ExpressError('detail', HttpStatus.INTERNAL_SERVER_ERROR);
		expect(err).toHaveProperty('title', '500 Server Error');
	});
});
