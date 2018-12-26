import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import * as jwt from 'jsonwebtoken';
import { JwtHandler } from '../../src/middleware/jwt.handler';
import { ServiceError } from '../../src/utils/service.error';

describe('JwtHandler', () => {
	const cert = 'publicKey';
	const token = 'token';
	const config = { jwtConfig: { publicKey: cert } };
	const userId = 'KkZogjZCwjq6IzE1QAQmrXaKTTMuUp4D';
	const claims: any = { userId: userId };

	let ctx: any;
	let next;
	let jwtHandler;
	let _jwt: sinon.SinonMock;

	beforeEach(() => {
		ctx = {
			get: (_header) => token,
			state: {}
		};
		_jwt = sinon.mock(jwt);
		jwtHandler = new JwtHandler({ config });
	});

	afterEach(() => {
		_jwt.verify();
	});

	describe('constructor', () => {
		it('should create new instance when options are empty', () => {
			const instance = new JwtHandler({});
			expect(instance).toBeDefined();
		});
	});

	it('should add claims to ctx', async () => {
		_jwt.expects('verify').withExactArgs(token, cert).returns(claims);

		next = sinon.stub();
		await jwtHandler.handle(ctx, next);
		expect(next.called).toBe(true);
		expect(ctx.state).toHaveProperty('claims', claims);
	});

	it('should throw unauthorized error when jwt verification fails', async () => {
		let err: any = new Error('error');
		err.status = HttpStatus.UNAUTHORIZED;

		_jwt.expects('verify').throws(err);

		await expect(jwtHandler.handle(ctx, next)).rejects.toBeInstanceOf(ServiceError);
	});

	it('should rethrow the error if it is not a 401 error', async () => {
		let err = new Error('uh oh');

		_jwt.expects('verify').throws(err);

		await expect(jwtHandler.handle(ctx, next)).rejects.toEqual(err);
	});

	it('should add itself to the app', (done) => {
		jwtHandler.init({
			use: (middleware) => {
				expect(middleware).toBeDefined();
				done();
			}
		});
	});
});
