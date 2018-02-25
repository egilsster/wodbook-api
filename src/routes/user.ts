import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import * as bodyParser from 'body-parser';

import BaseRouter from './base';
import { UserService } from '../services/user';
import ExpressError from '../utils/express.error';
import { UserSerializer } from '../utils/serialization/user.serializer';

export class UserRouter extends BaseRouter {
	public path: string = 'users';
	private userService: UserService;
	private serializer: UserSerializer;

	constructor(public options: any = {}) {
		super(options, 'router:user');
		this.userService = this.options.userService || new UserService(this.options);
		this.serializer = this.options.serializer || new UserSerializer(this.options);
		this.initRoutes();
	}

	initRoutes() {
		this.router.use(bodyParser.json());

		this.router.route('/me')
			.get(this.me.bind(this));

		super.useLogger();
	}

	async me(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const user = await this.userService.getUser(req['user']);

			if (!user) {
				throw new ExpressError('Not found', 'No user found with this email or password', HttpStatus.NOT_FOUND);
			}

			return res.status(HttpStatus.OK).json({
				'data': this.serializer.serialize(user, req)
			});
		} catch (err) {
			next(err);
		}
	}
}
