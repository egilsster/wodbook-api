import * as express from 'express';
const HttpStatus = require('http-status-codes');
import { ExpressError } from '../utils/express.error';

export default function requireJSON(req: express.Request, _res: express.Response, next: express.NextFunction) {
	if (!req.is('json')) {
		next(new ExpressError('The request must be a JSON object', HttpStatus.UNSUPPORTED_MEDIA_TYPE));
	} else {
		next();
	}
}
