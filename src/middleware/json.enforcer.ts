import * as Koa from 'koa';
import * as _ from 'lodash';
import { ServiceError } from '../utils/service.error';
import { ERROR_TEMPLATES } from '../utils/error.templates';

export class JsonEnforcer {
	/**
	 * Initializes the handler and injects it into the app
	 */
	init(app: Koa) {
		app.use(this.handle.bind(this));
	}

	/**
	 * The middleware function. Does not continue if
	 * data is not parsable.
	 *
	 * @param ctx The koa context
	 * @param next The next function
	 */
	async handle(ctx: Koa.Context, next: Function) {
		const contentType = ctx.get('content-type');
		if (contentType.includes('multipart')) {
			try {
				const data = _.get(ctx, 'request.body.data', '{}');
				if (_.isObject(data)) {
					return next();
				}
				const parsed = JSON.parse(data);
				if (!_.isObject(parsed)) {
					throw new Error();
				}
			} catch (err) {
				throw new ServiceError(ERROR_TEMPLATES.INVALID_REQUEST_FORMAT);
			}
		}
		return next();
	}
}
