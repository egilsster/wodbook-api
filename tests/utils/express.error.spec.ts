import ExpressError from '../../src/utils/express.error';

describe('ExpressError', () => {
	it('should have correct properties', () => {
		const error = new ExpressError('title', 'detail', 400);
		expect(error.title).toEqual('title');
		expect(error.detail).toEqual('detail');
		expect(error.status).toEqual(400);
	});
});
