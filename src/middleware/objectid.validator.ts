import * as express from 'express';
import * as mongoose from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import ExpressError from '../utils/express.error';

export function validateObjectId(req: express.Request, _res: express.Response, next: express.NextFunction) {
	try {
		const id = req.params.id;
		if (id && !mongoose.Types.ObjectId.isValid(id)) {
			return next(new ExpressError('Invalid Id', 'The Id specified is invalid', HttpStatus.BAD_REQUEST));
		}

		next();
	} catch (err) {
		next(err);
	}
}
