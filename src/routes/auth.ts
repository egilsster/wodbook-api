import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as HttpStatus from 'http-status-codes';
import { JwtUtils } from '../utils/jwt.utils';
import { AuthService } from '../services/auth';
import { ConfigService } from '../services/config';
import { User } from '../models/user';

export class AuthRouter extends Router {
	private configService: ConfigService;
	private authService: AuthService;

	constructor(options: any) {
		super();
		this.authService = options.authService || new AuthService(options);
		this.configService = options.configService || new ConfigService();
	}

	init(app: Koa) {
		this.prefix('/v1/auth');
		this.post('/login', ctx => this.login(ctx));
		this.post('/signup', ctx => this.signup(ctx));
		app.use(this.routes());
	}

	async login(ctx: Koa.Context) {
		const body = ctx.request.body;
		const user = await this.authService.login(body);
		const config = this.configService.getConfig();

		ctx.status = HttpStatus.OK;
		ctx.body = {
			token: this.signToken(user, config)
		};
	}

	async signup(ctx: Koa.Context) {
		const body = ctx.request.body;
		const user = await this.authService.signup(body);
		const config = this.configService.getConfig();

		ctx.status = HttpStatus.CREATED;
		ctx.body = {
			token: this.signToken(user, config)
		};
	}

	private signToken(user: User, config: Config) {
		return JwtUtils.signToken({
			userId: user.id,
			email: user.email,
			admin: user.admin
		}, config.jwtConfig.publicKey);
	}
}
