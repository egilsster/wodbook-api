import { Router, Request, Response, NextFunction } from 'express';
import { validateObjectId } from '../middleware/objectid.validator';
import { Logger } from '../utils/logger/logger';

export default class BaseRouter {
	public logger: Logger;
	public router: Router;

	constructor(public options: any = {}, loggerName: string) {
		this.logger = options.logger || new Logger(loggerName);
		this.router = Router();
	}

	protected logErrors(err: any, _req: Request, _res: Response, next: NextFunction) {
		this.logger.error(err);
		next(err);
	}

	protected getUsernameFromRequest(req: Request) {
		const user = req['user'] || {};
		return user.username;
	}

	protected useLogger() {
		this.router.use(this.logErrors.bind(this));
	}

	protected validateIdAsUuid() {
		this.router.param('id', validateObjectId);
	}
}
