import * as path from 'path';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import WorkoutRouter from '../routes/workout';
import HealthRouter from '../routes/health';
import ExpressError from './express.error';

const MONGO_ERROR_DUPLICATE_KEY_ON_INSERT = 11000;
const MONGO_ERROR_DUPLICATE_KEY_ON_UPDATE = 11001;

export default class RouterUtils {
	public static readonly LATEST_VERSION: string = 'v1';

	constructor(public options: any = {}) { }

	public registerMiddleware(_app: express.Application, ) {

	}

	public registerRoutes(app: express.Application) {
		// Static routes
		app.use('/api-docs', (_req: express.Request, res: express.Response) => res.sendFile(path.resolve('./api-docs.yml')));

		// Public routes
		const healthRouter = new HealthRouter();
		app.use('/health', healthRouter.router);

		// JWT verification goes here

		// Private routes
		const workoutRouterInstance = new WorkoutRouter();
		app.use(`/${RouterUtils.LATEST_VERSION}/${workoutRouterInstance.path}`, workoutRouterInstance.router);

		// If a route is not registered, return 404
		app.use((_req: express.Request, _res: express.Response, next: express.NextFunction) => {
			next(new ExpressError('Not Found', 'The requested route does not exist', HttpStatus.NOT_FOUND));
		});

		app.use(RouterUtils.errorHandler);
	}

	public static errorHandler(err: any, _req: express.Request, res: express.Response, next: express.NextFunction) {
		if (res.headersSent) {
			return next(err);
		}
		if (err.name === 'MongoError') {
			err = RouterUtils.handleMongoError(err);
		}
		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		if (err instanceof ExpressError) {
			status = err.status;
		} else if (err.name === 'ValidationError') {
			status = HttpStatus.UNPROCESSABLE_ENTITY;
		}
		res.status(status).send(err);
	}

	/**
	 * This method convert a MongoError to an ExpressError when a "unique constraint validation error" is thrown from MongoDB
	 * If its not a MongoError (check is by err.name === 'MongoError' because the type is Error) it will just throw it to the next level
	 * for a complete list of mongo error codes see: https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.err
	 * 11000 and 11001 are unique constraint validation error (for single field and compound fields) Insert and Update respectively
	 * @param {Error} err the error assumed to be from MongoDB
	 */
	public static handleMongoError(err) {
		if (err.code === MONGO_ERROR_DUPLICATE_KEY_ON_INSERT || err.code === MONGO_ERROR_DUPLICATE_KEY_ON_UPDATE) {
			return new ExpressError('Conflict', `A Resource with the same unique identity already exists. Inner Message: ${err.message}`, HttpStatus.CONFLICT);
		}
		return err;
	}
}
