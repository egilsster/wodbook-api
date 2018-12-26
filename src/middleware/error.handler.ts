import * as Koa from 'koa';
import { ErrorUtils } from '../utils/error.utils';

export class ErrorHandler {
	async handle(ctx: Koa.Context, next: Function) {
		try {
			await next();
		} catch (err) {
			const error = ErrorUtils.ensureServiceError(err);
			ctx.status = error.status;
			ctx.body = error;
		}
	}

	init(app: Koa) {
		app.use(this.handle.bind(this));
	}

	/**
	 * Middleware function which will catch an error from the next function and set the correct status code in the ctx before re-throwing the error
	 * @param {koa.Context} ctx The koa context
	 * @param {Function} next The next function
	 * @throws {Error} Any error that the next function throws
	 */
	async statusCodeHandler(ctx: Koa.Context, next: Function) {
		try {
			await next();
		} catch (err) {
			let status = Number(err.status);
			ctx.status = status >= 100 && status < 600 ? status : 500;
			throw err;
		}
	}

	/**
	 * Returns an init-able object which injects a status code handler into the app
	 * @returns {Object} Init-able which injects the status code handler
	 */
	statusCodeInjector(): object {
		let handler = this.statusCodeHandler;
		return {
			init(app) {
				app.use(handler);
			}
		};
	}
}
