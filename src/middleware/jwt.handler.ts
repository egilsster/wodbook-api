import * as Koa from 'koa';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import * as HttpStatus from 'http-status-codes';
import { ServiceError } from '../utils/service.error';
import { ERROR_TEMPLATES } from '../utils/error.templates';

export class JwtHandler {
	private config;

	constructor(options: any) {
		this.config = options.config;
	}

	/**
	 * Initializes the handler and injects it into the app
	 */
	init(app: Koa) {
		app.use(this.handle.bind(this));
	}

	/**
	 * The middleware function
	 * @param ctx The koa context
	 * @param next The next function
	 */
	async handle(ctx: Koa.Context, next: Function) {
		try {
			const token = ctx.get('authorization').replace('Bearer ', '');
			const claims = jwt.verify(token, this.config.jwtConfig.publicKey);
			ctx.state.claims = claims;
			await next();
		} catch (err) {
			if (err.status === HttpStatus.UNAUTHORIZED) {
				throw new ServiceError(ERROR_TEMPLATES.UNAUTHORIZED);
			}
			throw err;
		}
	}
}
