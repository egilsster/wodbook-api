import { Router, Request, Response, NextFunction } from 'express';

export default class BaseRouter {
	public router: Router;

	constructor(public options: any = {}) {
		this.router = Router();
	}

	protected logErrors(err: any, _req: Request, _res: Response, next: NextFunction) {
		console.error(err);
		next(err);
	}

	protected getUsernameFromRequest(req: Request) {
		const user = req['user'] || {};
		return user.username;
	}

	protected useLogger() {
		this.router.use(this.logErrors.bind(this));
	}
}
