import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import * as jwt from 'jsonwebtoken';
import JwtVerify from '../../src/middleware/jwt.verify';

describe('JwtVerify', () => {
	const secret = 'testing';
	const jwtVerify = JwtVerify(btoa(secret));
	const payload = { 'email': 'user@email.com' };
	let token: string;
	let res;
	let _res: sinon.SinonMock;
	let _next: sinon.SinonStub;

	beforeEach(() => {
		token = jwt.sign(payload, secret);

		res = {
			sendStatus() { }
		};
		_res = sinon.mock(res);
		_next = sinon.stub();
	});

	afterEach(() => {
		_res.restore();
		_next.reset();
	});

	function verifyAll() {
		_res.verify();
	}

	it('should call next if JWT is valid', () => {
		const req = { token };
		jwtVerify(req, res, _next);

		expect(_next.callCount).toBe(1);
		expect(req).toHaveProperty('user');
		verifyAll();
	});

	it('should call sendStatus with 401 Unauthorized if JWT is not valid', () => {
		const invalidToken = jwt.sign(payload, btoa('incorrectSeceret'));
		const req = { token: invalidToken };
		_res.expects('sendStatus').calledWith(HttpStatus.UNAUTHORIZED);

		jwtVerify(req, res, _next);

		expect(_next.callCount).toBe(0);
		expect(req).not.toHaveProperty('user');
	});

	it('should call sendStatus with 401 Unauthorized if there is no JWT on the request', () => {
		const req = {};
		_res.expects('sendStatus').calledWith(HttpStatus.UNAUTHORIZED);

		jwtVerify(req, res, _next);

		expect(_next.callCount).toBe(0);
		expect(req).not.toHaveProperty('user');
	});
});