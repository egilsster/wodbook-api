import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as HttpStatus from 'http-status-codes';
import { UserService } from '../services/user';

export class UserRouter extends Router {
	private userService: UserService;

	constructor(options: any) {
		super();
		this.userService = options.userService || new UserService(options);
	}

	init(app: Koa) {
		this.prefix('/v1/users');
		this.get('/me', ctx => this.me(ctx));
		app.use(this.routes());
	}

	async me(ctx: Koa.Context) {
		const claims: Claims = ctx.state.claims;
		const userId = claims.userId;
		const data = await this.userService.getUserById(userId);

		ctx.status = HttpStatus.OK;
		ctx.body = data.toObject();
	}
}
