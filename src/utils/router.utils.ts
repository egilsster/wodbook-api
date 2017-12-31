import * as path from 'path';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import * as bearerToken from 'express-bearer-token';
import * as expressWinston from 'express-winston';

import jwtVerify from '../middleware/jwt.verify';
import WorkoutRouter from '../routes/workout';
import HealthRouter from '../routes/health';
import ExpressError from './express.error';
import MywodRouter from '../routes/mywod';
import UserRouter from '../routes/user';
import MovementRouter from '../routes/movement';
import { logContextInjector } from './logger/log.context.injector';

const MONGO_ERROR_DUPLICATE_KEY_ON_INSERT = 11000;
const MONGO_ERROR_DUPLICATE_KEY_ON_UPDATE = 11001;

export default class RouterUtils {
	public static readonly LATEST_VERSION: string = 'v1';

	constructor(public options: any = {}) { }

	public registerMiddleware(app: express.Application, logger) {
		app.use(bearerToken());
		app.use(logContextInjector());
		app.use(expressWinston.logger({
			'winstonInstance': logger,
			'requestWhitelist': ['url', 'user', 'method', 'query', 'endpoint', 'logTraceId'],
			'statusLevels': true,
			// slightly prettier output in local dev
			'expressFormat': process.env.NODE_ENV === 'development'
		}));
	}

	public registerRoutes(app: express.Application, config: any) {
		// Static routes
		app.use('/api-docs', (_req: express.Request, res: express.Response) => res.sendFile(path.resolve('./api-docs.yml')));

		// Public routes
		const healthRouter = new HealthRouter();
		app.use('/health', healthRouter.router);

		const userRouterInstance = new UserRouter();
		app.use(`/${RouterUtils.LATEST_VERSION}/${userRouterInstance.path}`, userRouterInstance.router);

		app.use(jwtVerify(config.webtokens.public));

		// Private routes
		const workoutRouterInstance = new WorkoutRouter();
		app.use(`/${RouterUtils.LATEST_VERSION}/${workoutRouterInstance.path}`, workoutRouterInstance.router);

		const movementRouterInstance = new MovementRouter();
		app.use(`/${RouterUtils.LATEST_VERSION}/${movementRouterInstance.path}`, movementRouterInstance.router);

		const mywodRouterInstance = new MywodRouter();
		app.use(`/${RouterUtils.LATEST_VERSION}/${mywodRouterInstance.path}`, mywodRouterInstance.router);

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
