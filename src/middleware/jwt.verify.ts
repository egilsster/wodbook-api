import * as jwt from 'jsonwebtoken';
import * as HttpStatus from 'http-status-codes';

export default (cert) => {
	return (req, res, next) => {
		const decodedCert = Buffer.from(cert, 'base64').toString('UTF-8');

		jwt.verify(req.token, decodedCert, function (err, user) {
			if (err) {
				res.sendStatus(HttpStatus.UNAUTHORIZED);
			} else {
				req.user = user;
				next();
			}
		});
	};
};
