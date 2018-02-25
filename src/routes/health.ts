import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import BaseRouter from './base';

export default class HealthRouter extends BaseRouter {
	public path: string = 'health';

	constructor(options: any = {}) {
		super(options, 'router:health');
		this.initRoutes();
	}

	initRoutes() {
		this.router.route('/')
			.get(this.get.bind(this));

		super.useLogger();
	}

	async get(_req: express.Request, res: express.Response) {
		return res.status(HttpStatus.OK).send({ status: HttpStatus.OK });
	}
}
