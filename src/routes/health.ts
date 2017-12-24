import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import BaseRouter from './base';

export default class HealthRouter extends BaseRouter {
	public path: string = 'health';
	public router: express.Router;

	constructor(options: any = {}) {
		super(options);
		this.initRoutes();
	}

	initRoutes() {
		this.router.route('/')
			.get(this.get.bind(this));

		super.useLogger();
	}

	async get(_req: express.Request, res: express.Response) {
		return res.sendStatus(HttpStatus.OK);
	}
}
