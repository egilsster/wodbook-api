import * as Koa from 'koa';
import * as koaRequestLogger from 'koa-logger';
import * as _ from 'lodash';
import { Logger } from '../utils/logger/logger';
import * as uid from 'uid-safe';
import * as stripAnsi from 'strip-ansi';
import { sanitizeQueryParams } from '../utils/url';
import { sanitizeHeaders } from '../utils/http.utils';

/**
 * Logger for Koa HTTP requests. Logs when request begins and ends processing with relevant context.
 */
export class RequestLogger {
	private logger: Logger;
	private sensitiveQueryParams: string[];
	private headerLoggingBlacklist: string[];

	constructor(options: any) {
		this.logger = options.logger || new Logger('middleware:requestLogger');
		this.sensitiveQueryParams = options.sensitiveQueryParams || [];
		this.headerLoggingBlacklist = ['authorization', 'cookie'];
		if (_.isArray(options.headerLoggingBlacklist)) {
			this.headerLoggingBlacklist = options.headerLoggingBlacklist;
		}
	}

	/**
	 * Wraps koa-logger to sensitive sanitize query parameters while executing the middleware call chain.
	 * @param ctx - koa request context
	 * @param next - next middleware function
	 */
	async handle(ctx: Koa.Context, next) {
		_.set(ctx, 'state.logTraceId', uid.sync(18));
		const logCtx: any = {
			method: _.get(ctx, 'request.method'),
			originalUrl: sanitizeQueryParams(ctx.originalUrl, this.sensitiveQueryParams),
			body: ctx.body,
			res: ctx.res,
			response: ctx.response
		};
		// we now initialize koa-logger with our logger transport and execute it with our logging-sanitized context
		const logRequestContext = {
			headers: sanitizeHeaders(ctx.request.header, this.headerLoggingBlacklist),
			logTraceId: ctx.state.logTraceId
		};
		const koaLoggerFunc = koaRequestLogger(this.transport.bind(this, logRequestContext));
		await koaLoggerFunc(logCtx, async () => {
			// wait for next() completion and then update status code in logging context
			await next();
			logCtx.status = ctx.status;
		});
	}

	/**
	 * Transport for logging request details
	 * @param str - output string with ANSI Color codes embedded
	 * @param args - array by [format, method, url, status, time, length]
	 */
	transport(logRequestContext, str, args) {
		let logParams: any = {};
		if (args && args.length === 6) {
			logParams = {
				method: args[1],
				path: args[2],
				responseCode: args[3],
				responseTime: args[4]
			};
		}
		logParams.logTraceId = logRequestContext.logTraceId;
		logParams.headers = logRequestContext.headers;
		this.logger.verbose(stripAnsi(str), logParams);
	}

	/**
	 * Initiate middleware
	 * @param app - Koa app
	 */
	init(app) {
		app.use(this.handle.bind(this));
	}
}
