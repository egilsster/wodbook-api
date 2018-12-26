import * as winston from 'winston';
import * as _ from 'lodash';
import * as cls from 'cls-hooked';

/**
 * Adds a transform function which a service can implement to customize the final logging context before logging.
 */
let contextTransformFunc;

// Shared winston logger among all Logger instances to save memory!
let winstonLogger;

// the static context that gets added to each message
let STATIC_CONTEXT = {};

const LOG_LEVELS = {
	fatal: 0,
	error: 0,
	warn: 1,
	info: 2,
	verbose: 3,
	debug: 4,
	trace: 5,
	silly: 6
};

/**
 * Logger is a thin wrapper around winston.
 */
export class Logger {
	static LOG_LEVELS = LOG_LEVELS;

	// Cache of compiled templates
	static templates = {};

	winston: any;
	defaultContext: any;

	constructor(module?, options?) {
		options = options || {};
		this.winston = options.winstonLogger || Logger.getWinstonLogger();
		this.defaultContext = { pid: process.pid };
		_.merge(this.defaultContext, STATIC_CONTEXT, module ? { module } : {}, options.context);
	}

	_createContext(req, state) {
		if (_.isEmpty(req) && _.isEmpty(state)) {
			return {};
		}
		let userId = _.get(req, 'user.id') || _.get(state, 'user.id') || _.get(state, 'claims.userId');
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
	 * Silly level of verbosity
	 */
	silly() {
		this.log('silly', [].slice.call(arguments));
	}

	/**
	 * TRACE
	 * Fine-grained debug message, typically used to capture a flow of events.
	 */
	public trace(..._args) {
		this.log('trace', [].slice.call(arguments));
	}

	/**
	 * DEBUG
	 * - Mostly used for debugging purposes.
	 * - Typically not enabled by default in production.
	 */
	public debug(..._args) {
		this.log('debug', [].slice.call(arguments));
	}

	/**
	 * VERBOSE
	 */
	public verbose(..._args) {
		this.log('verbose', [].slice.call(arguments));
	}

	/**
	 * INFO
	 * - Normal operations of the service that should be logged.
	 * - Indicate some important operation or state in the service.
	 */
	public info(..._args) {
		this.log('info', [].slice.call(arguments));
	}

	/**
	 * WARNING
	 *  - Indicate an event or state that was not part of common operations, but was handled.
	 *  - Event that potentially can become an error.
	 *  - Event that does not prevent correct operation of the system from an end-user perspective.
	 */
	public warn(..._args) {
		this.log('warn', [].slice.call(arguments));
	}

	/**
	 * ERROR
	 * - Unhandled error that was unexpected to the service.
	 * - Service can continue normal operation after error recovery.
	 */
	public error(..._args) {
		this.log('error', [].slice.call(arguments));
	}

	/**
	 * FATAL
	 * - Non-recoverable error that forces the service to terminate.
	 */
	public fatal(..._args) {
		this.log('fatal', [].slice.call(arguments));
	}

	/**
	 * @param level - the log level
	 * @param args - an array of arguments to the log function
	 */
	public log(level, args) {
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
	massageArgsForWinston(level: string, args: string | string[]) {
		if (typeof args === 'string') {
			args = [args];
		}

		args.unshift(level);
		let lastArg = args[args.length - 1];
		let msgContext;

		if (this.isMessageCodeArgs(args)) {
			let result = this.messageCodeArgsAndMsgContext(level, args);
			args = result.args;
			msgContext = result.msgContext;
		} else if (args.length === 2 && (_.isObject(lastArg) && !_.isError(lastArg))) {
			msgContext = args.pop();
			args.splice(1, 0);
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
		let ns = cls.getNamespace('logger');
		let req = ns.get('req');
		let state = ns.get('state');
		if (req) {
			context = this._createContext(req, state);
		}

		context = _.merge(context, this.defaultContext);

		if (_.isObject(msgContext)) {
			context = _.merge(context, msgContext);
		}

		if (contextTransformFunc) {
			context = contextTransformFunc(context, { req, state });
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
		let rendered;
		try {
			rendered = compiledTemplate(params);
		} catch (err) {
			rendered = template;
		}
		return rendered;
	}

	/**
	 * Converts a query object into an array of k/v pairs. Filters out any key-less
	 * values (i.e. elements in the query string where no `=` is present), to avoid
	 * high cardinality fields.
	 */
	static _parseQuery = function (req) {
		let pairs = _.toPairs(_.get(req, 'query', {}));
		return _.filter(pairs, n => n[1]);
	};

	/**
	 * Adds a static global context value
	 */
	static addContext = function (context) {
		_.merge(STATIC_CONTEXT, context);
	};

	static setContext = function (context) {
		STATIC_CONTEXT = context;
	};

	static setContextTransform = function (transformFunc) {
		if (_.isFunction(transformFunc)) {
			contextTransformFunc = transformFunc;
		}
	};

	static clearContextTransform = function () {
		contextTransformFunc = undefined;
	};

	static getWinstonLogger = function () {
		if (!winstonLogger) {
			let logOpts = {
				timestamp: function () {
					return new Date().toISOString();
				},
				json: true,
				stringify: true,
				colorize: false,
				level: _.toLower(process.env.LOG_LEVEL || 'info'),
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

			winstonLogger = new (winston.Logger)({
				transports,
				levels: LOG_LEVELS,
				exitOnError: true
			});
			winstonLogger.emitErrors = false;
		}
		return winstonLogger;
	};

	static _resetLogger = function () {
		winstonLogger = undefined;
	};
}
