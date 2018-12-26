import * as jwt from 'jsonwebtoken';
import { JwtUtils } from '../../src/utils/jwt.utils';

describe('JwtUtils', () => {
	describe('signToken', () => {
		it('should return a token that expires in 12h', () => {
			const token = JwtUtils.signToken({ userId: 'test' }, 'secret');

			const decoded = jwt.decode(token) || {};
			const expiresIn = (decoded['exp'] - decoded['iat']) / 60 / 60;
			expect(expiresIn).toEqual(12);
		});

		it('should return token with payload', () => {
			const token = JwtUtils.signToken({ userId: 'test' }, 'secret');

			const decoded = jwt.decode(token) || {};
			expect(decoded).toHaveProperty('userId', 'test');
		});
	});
});
