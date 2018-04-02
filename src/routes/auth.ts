import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import * as bodyParser from 'body-parser';
import * as config from 'config';

import BaseRouter from './base';
import { JwtUtils } from '../utils/jwt.utils';
import { AuthService } from '../services/auth';
import { UserType } from '../models/user';

export class AuthRouter extends BaseRouter {
	public path: string = 'auth';
	private authService: AuthService;

	constructor(options: any = {}) {
		super(options, 'router:auth');
		this.authService = this.options.authService || new AuthService(this.options);
		this.initRoutes();
	}

	initRoutes() {
		this.router.use(bodyParser.json());

		this.router.route('/login')
			.post(this.login.bind(this));

		this.router.route('/register')
			.post(this.register.bind(this));

		super.useLogger();
	}

	async login(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const user = await this.authService.login(req.body.data);

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
			const user = await this.authService.register(req.body.data);
			const webtokens: any = config.get('webtokens');

			return res.status(HttpStatus.CREATED).json({
				'data': {
					token: JwtUtils.signToken(this.getPayload(user), webtokens.public)
				}
			});
		} catch (err) {
			next(err);
		}
	}

	private getPayload(user: UserType) {
		return {
			id: user._id,
			email: user.email,
			admin: user.admin
		};
	}
}
