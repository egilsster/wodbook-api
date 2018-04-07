import * as path from 'path';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import * as bearerToken from 'express-bearer-token';
import * as expressWinston from 'express-winston';
import * as config from 'config';

import jwtVerify from '../middleware/jwt.verify';
import WorkoutRouter from '../routes/workout';
import HealthRouter from '../routes/health';
import { ExpressError } from './express.error';
import MyWodRouter from '../routes/my.wod';
import { AuthRouter } from '../routes/auth';
import { MovementRouter } from '../routes/movement';
import { logContextInjector } from './logger/log.context.injector';
import { UserRouter } from '../routes/user';
import { ErrorUtils } from './error.utils';

export default class RouterUtils {
	public static readonly LATEST_VERSION: string = 'v1';

	constructor(public options: any = {}) { }

	public registerMiddleware(app: express.Application, logger) {
		app.use(bearerToken());
		app.use(logContextInjector());
		app.use(expressWinston.logger({
			'winstonInstance': logger,
			'requestWhitelist': ['url', 'user', 'method', 'query', 'endpoint'],
			'statusLevels': true,
			// slightly prettier output in local dev
			'expressFormat': process.env.NODE_ENV === 'development'
		}));
	}

	public registerRoutes(app: express.Application) {
		// Static routes
		app.use('/api-docs', (_req: express.Request, res: express.Response) => res.sendFile(path.resolve('./api-docs.yml')));

		app.use('/public', express.static('public'));

		// Public routes
		const healthRouter = new HealthRouter();
		app.use('/health', healthRouter.router);

		const authRouterInstance = new AuthRouter();
		app.use(`/${RouterUtils.LATEST_VERSION}/${authRouterInstance.path}`, authRouterInstance.router);

		const webtokens = config.get<WebTokenConfig>('webtokens');
		app.use(jwtVerify(webtokens.public));

		// Private routes
		const privateRoutes = [
			new UserRouter(),
			new WorkoutRouter(),
			new MovementRouter(),
			new MyWodRouter()
		];

		for (const instance of privateRoutes) {
			app.use(`/${RouterUtils.LATEST_VERSION}/${instance.path}`, instance.router);
		}

		// If a route is not registered, return 404
		app.use((_req: express.Request, _res: express.Response, next: express.NextFunction) => {
			next(new ExpressError('The requested route does not exist', HttpStatus.NOT_FOUND));
		});

		app.use(RouterUtils.errorHandler);
	}

	public static errorHandler(err: any, _req: express.Request, res: express.Response, next: express.NextFunction) {
		if (res.headersSent) {
			return next(err);
		}
		let status: number;
		const expressErr = ErrorUtils.ensureExpressError(err);
		if (Array.isArray(expressErr)) {
			status = expressErr[0].status;
		} else {
			status = expressErr.status;
		}
		res.status(status).send(expressErr);
	}
}
