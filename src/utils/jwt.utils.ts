import * as jwt from 'jsonwebtoken';

export class JwtUtils {
	public static signToken(payload: object, secret: string) {
		return jwt.sign(payload, secret, {
			expiresIn: '12h'
		});
	}
}
