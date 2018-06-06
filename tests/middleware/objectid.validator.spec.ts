const HttpStatus = require('http-status-codes');
import { ExpressError } from '../../src/utils/express.error';
import { validateObjectId } from '../../src/middleware/objectid.validator';

describe('validateObjectId', () => {
	const res: any = {};
	let _next: jest.Mock<{}>;

	beforeEach(() => {
		_next = jest.fn();
	});

	afterEach(() => {
		_next.mockReset();
	});

	it('should call next if id is specified and is valid', () => {
		const req: any = {
			params: {
				id: '5a4704d146425f97c638bcce'
			}
		};

		validateObjectId(req, res, _next);

		expect(_next).toHaveBeenCalledTimes(1);
		expect(_next).toBeCalledWith();
	});

	it('should call next if there is no id on the request', () => {
		const req: any = {
			params: {}
		};

		validateObjectId(req, res, _next);

		expect(_next).toHaveBeenCalledTimes(1);
		expect(_next).toBeCalledWith();
	});

	it('should call next with express error if id is specified and is invalid', () => {
		const req: any = {
			params: {
				id: 'invalidId'
			}
		};

		validateObjectId(req, res, _next);

		expect(_next).toHaveBeenCalledTimes(1);
		expect(_next).toBeCalledWith(new ExpressError('The Id specified is not valid', HttpStatus.BAD_REQUEST));
	});
});
