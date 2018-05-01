import { Router, Request, Response, NextFunction } from 'express';
import { validateObjectId } from '../middleware/objectid.validator';
import { Logger } from '../utils/logger/logger';

export default class BaseRouter {
	public path: string;
	public logger: Logger;
	public router: Router;

	constructor(public options: any = {}, moduleName: string) {
		this.path = moduleName;
		this.logger = options.logger || new Logger(`router:${moduleName}`);
		this.router = Router();
	}

	protected logErrors(err: any, _req: Request, _res: Response, next: NextFunction) {
		this.logger.error(err);
		next(err);
	}

	protected useLogger() {
		this.router.use(this.logErrors.bind(this));
	}

	protected validateIdAsUuid() {
		this.router.param('id', validateObjectId);
	}
}
