import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import * as _ from 'lodash';
import * as cls from 'continuation-local-storage';
import { logContextInjector } from './log.context.injector';

// the static context that gets added to each message
let STATIC_CONTEXT = {};

let LOG_LEVELS = {
	fatal: 0,
	error: 0,
	warn: 1,
	info: 2,
	verbose: 3,
	debug: 4,
	trace: 5,
	silly: 6
};

// Shared winston logger among all Logger instances to save memory!
let winstonLogger;

/**
 * Logger is a thin wrapper around winston.
 */
export class Logger {
	public static LOG_LEVELS = LOG_LEVELS;

	// Cache of compiled templates
	public static templates = {};

	public winston;
	public defaultContext;

	constructor(moduleName?: string, options: any = {}) {
		this.winston = options.winstonLogger || Logger.getWinstonLogger();
		this.defaultContext = { pid: process.pid };
		_.merge(this.defaultContext, STATIC_CONTEXT, { module: moduleName }, options.context);
	}

	_createContext(req) {
		if (!req) {
			return {};
		}
		let userId;
		if (req && req.user) {
			userId = req.user.id;
		}

		return {
			id: req.id,
			ip: req.ip,
			url: req.url,
			method: req.method,
			query: Logger._parseQuery(req),
			userId
		};
	}

	/**
	 * Injects the logContextInjector and a configured winston logger into the given express app
	 * @param {object} app - The express app
	 * @param {object} options - Send [Optional] function parameters
	 * @param {object} options.ignoreRouteFunc (Optional) - The function to determine if a given request
	 * shouldn't be logged by winston, if no value is provided then health checks and metrics requests will be ignored
	 */
	public static injectLogger(app, options?: any) {
		app.use(logContextInjector());
		if (_.isFunction(options)) {
			let ignoreRoute = options;
			options = { ignoreRoute };
		}
		options = options || {};
		if (!options.winstonInstance) {
			let logger = options.logger || new Logger('express-winston');
			delete options.logger;
			options.winstonInstance = options.winstonInstance || { log: logger._wrappedLog.bind(logger) };
		}
		app.use(this.createWinstonLogger(options));
	}

	/**
	 * TRACE
	 * Fine-grained debug message, typically used to capture a flow of events.
	 */
	trace(..._args) {
		this.log('trace', [].slice.call(arguments));
	}

	/**
	 * DEBUG
	 * - Mostly used for debugging purposes.
	 * - Typically not enabled by default in production.
	 */
	debug(..._args) {
		this.log('debug', [].slice.call(arguments));
	}

	/**
	 * VERBOSE
	 */
	verbose(..._args) {
		this.log('verbose', [].slice.call(arguments));
	}

	/**
	 * INFO
	 * - Normal operations of the service that should be logged.
	 * - Indicate some important operation or state in the service.
	 */
	info(..._args) {
		this.log('info', [].slice.call(arguments));
	}

	/**
	 * WARNING
	 *  - Indicate an event or state that was not part of common operations, but was handled.
	 *  - Event that potentially can become an error.
	 *  - Event that does not prevent correct operation of the system from an end-user perspective.
	 */
	warn(..._args) {
		this.log('warn', [].slice.call(arguments));
	}

	/**
	 * ERROR
	 * - Unhandled error that was unexpected to the service.
	 * - Service can continue normal operation after error recovery.
	 */
	error(..._args) {
		this.log('error', [].slice.call(arguments));
	}

	/**
	 * FATAL
	 * - Non-recoverable error that forces the service to terminate.
	 */
	fatal(..._args) {
		this.log('fatal', [].slice.call(arguments));
	}

	/**
	 * @param level - the log level
	 * @param args - an array of arguments to the log function
	 */
	log(level, args) {
		args = this.massageArgsForWinston(level, args);
		this.winston.log.apply(this.winston, args);
	}

	_wrappedLog() {
		let args = [].slice.call(arguments);
		let level = args.shift();
		this.log(level, args);
	}

	/**
	 * Transform the arguments to those understood by winston
	 */
	massageArgsForWinston(level, args) {
		args.unshift(level);

		let lastArg = args[args.length - 1];
		let msgContext;

		if (this.isMessageCodeArgs(args)) {
			let result = this.messageCodeArgsAndMsgContext(level, args);
			args = result.args;
			msgContext = result.msgContext;
		} else if (args.length === 2 && (_.isObject(lastArg) && !_.isError(lastArg))) {
			msgContext = args.pop();
			args.splice(1, 0, undefined);
		} else if (_.isObject(lastArg) && !_.isError(lastArg)) {
			msgContext = args.pop();
		}
		let context = this.computeContext(msgContext);
		context.logseverity = level.toUpperCase();
		args.push(context);

		return args;
	}

	/**
	 * Determines the args and msgContext for a message code type log
	 */
	messageCodeArgsAndMsgContext(level, args) {
		let msgStruct = args[1];
		let paramsOrMsgContext = args[2];
		let msgContext = args[3];

		let message = this.applyTemplate(msgStruct.template, paramsOrMsgContext);
		msgContext = msgContext || paramsOrMsgContext || {};
		msgContext.code = msgStruct.code;

		_.merge(msgContext, paramsOrMsgContext);
		return {
			msgContext,
			args: [level, message]
		};
	}

	computeContext(msgContext) {
		let context;
		let req = cls.getNamespace('logger').get('req');
		if (req) {
			context = this._createContext(req);
		}

		context = _.merge(context, this.defaultContext);

		if (_.isObject(msgContext)) {
			context = _.merge(context, msgContext);
		}

		return context;
	}

	isMessageCodeArgs(args) {
		if (args && args[1]) {
			let keys = _.keys(args[1]);
			// check if the argument is an object with only code and template properties
			return keys.length === 2 && _.intersection(['code', 'template'], keys).length === 2;
		}

		return false;
	}

	applyTemplate(template, params) {
		let compiledTemplate = Logger.templates[template];
		if (!compiledTemplate) {
			compiledTemplate = _.template(template);
			Logger.templates[template] = compiledTemplate;
		}

		return compiledTemplate(params);
	}

	/**
	 * Converts a query object into an array of k/v pairs. Filters out any key-less
	 * values (i.e. elements in the query string where no `=` is present), to avoid
	 * high cardinality fields.
	 */
	public static _parseQuery = function (req) {
		let pairs = _.toPairs(_.get(req, 'query', {}));
		return _.filter(pairs, n => n[1]);
	};

	/**
	 * Default RequestFilter function that will be passed into the expressWinston.logger
	 */
	public static _defaultRequestFilter = function (req, propName) {
		// Insert 'endpoint' that contains req method and params removed
		if (propName === 'endpoint') {
			let endpoint = req.path;
			for (const param in req.params) {
				endpoint = endpoint.replace(req.params[param], `{${param}}`);
			}
			return `${req.method} ${endpoint}`;
		} else if (propName === 'user_agent') {
			return _.get(req, 'headers.user-agent');
		} else if (propName === 'query') {
			return Logger._parseQuery(req);
		}
		return req[propName];
	};

	/**
	 * Default IgnoreRoute function that will be passed into the expressWinston.logger
	 */
	public static _defaultIgnoreRoute(req) {
		// Health check and metrics routes are too chatty.
		return (req.url === '/health' || req.url === '/metrics');
	}

	/**
	 * Create an express-winston middleware logging function
	 *
	 * @param {object}  options Send [Optional] function parameters. Supports the same
	 * options supported by express-winston: https://www.npmjs.com/package/express-winston#options
	 */
	public static createWinstonLogger(options: any = {}) {
		if (_.isFunction(options)) {
			let ignoreRoute = options;
			options = { ignoreRoute };
		}

		options.winstonInstance = options.winstonInstance || Logger.getWinstonLogger();
		options.requestWhitelist = options.requestWhitelist || ['url', 'user', 'method', 'query', 'endpoint', 'user_agent'];
		options.responseWhitelist = options.responseWhitelist;
		options.statusLevels = options.statusLevels || true;
		// slightly prettier output in local dev
		options.expressFormat = options.expressFormat || process.env.NODE_ENV === 'development';
		options.requestFilter = options.requestFilter || options.defaultRequestFilter || Logger._defaultRequestFilter;
		options.ignoreRoute = options.ignoreRoute || Logger._defaultIgnoreRoute;

		return expressWinston.logger(options);
	}

	/**
	 * Adds a static global context value
	 */
	public static addContext(context) {
		_.merge(STATIC_CONTEXT, context);
	}

	public static setContext(context) {
		STATIC_CONTEXT = context;
	}

	public static getWinstonLogger() {
		if (!winstonLogger) {
			let logOpts: any = {
				timestamp: function () {
					return new Date().toISOString();
				},
				json: true,
				stringify: true,
				level: process.env.LOG_LEVEL || 'info',
				handleExceptions: true,
				humanReadableUnhandledException: true
			};

			if (process.env.NODE_ENV === 'development') {
				delete logOpts.timestamp;
				delete logOpts.json;
				delete logOpts.stringify;
				logOpts.colorize = true;
			}

			let transports = [new (winston.transports.Console)(logOpts)];

			winstonLogger = new winston.Logger({
				transports,
				levels: LOG_LEVELS,
				exitOnError: true
			});
			winstonLogger.emitErrors = false;
		}
		return winstonLogger;
	}

	public static _resetLogger() {
		winstonLogger = undefined;
	}
}
