import * as jwt from 'jsonwebtoken';
const HttpStatus = require('http-status-codes');

export default (cert) => {
	return (req, res, next) => {
		const decodedCert = Buffer.from(cert, 'base64').toString('UTF-8');

		try {
			const user = jwt.verify(req.token, decodedCert);
			req.user = user;
			next();
		} catch (err) {
			res.sendStatus(HttpStatus.UNAUTHORIZED);
		}
	};
};
