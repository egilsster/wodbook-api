import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import * as bodyParser from 'body-parser';

import BaseRouter from './base';
import ExpressError from '../utils/express.error';
import { JwtUtils } from '../utils/jwt.utils';
import { UserService } from '../services/user';
import { UserType } from '../models/user';

export default class UserRouter extends BaseRouter {
	public path: string = 'users';
	private userService: UserService;

	constructor(options: any = {}) {
		super(options);
		this.userService = options.userService || new UserService(options);
		this.initRoutes();
	}

	protected initRoutes() {
		this.router.use(bodyParser.json());

		this.router.route('/login')
			.post(this.login.bind(this));

		this.router.route('/register')
			.post(this.register.bind(this));

		super.useLogger();
	}

	requireJSON(req: express.Request, _res: express.Response, next: express.NextFunction) {
		if (!req.is('json')) {
			next(new ExpressError('Unsupported media type', 'The request must be a JSON object', HttpStatus.UNSUPPORTED_MEDIA_TYPE));
		} else {
			next();
		}
	}

	async login(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const userData = req.body.data;
			const user = await this.userService.login(userData);

			return res.status(HttpStatus.OK).json({
				'data': {
					token: JwtUtils.signToken(this.getPayload(user), 'publicKey')
				}
			});
		} catch (err) {
			next(err);
		}
	}

	async register(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const userData = req.body.data;
			const user = await this.userService.register(userData);

			return res.status(HttpStatus.OK).json({
				'data': {
					token: JwtUtils.signToken(this.getPayload(user), 'publicKey')
				}
			});
		} catch (err) {
			next(err);
		}
	}

	private getPayload(user: UserType) {
		return {
			email: user.email,
			admin: user.admin
		};
	}
}
