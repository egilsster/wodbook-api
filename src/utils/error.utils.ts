import { ServiceError } from './service.error';
import { ERROR_TEMPLATES } from './error.templates';
import { Logger } from './logger/logger';

export const MONGO_ERRORS = Object.freeze({
	DUPLICATE_KEY_ON_INSERT: 11000,
	DUPLICATE_KEY_ON_UPDATE: 11001,
	KEY_TOO_LONG: 17280
});

export class ErrorUtils {
	public static logger: Logger = new Logger('utils:ErrorUtils');

	/**
	 * Used by the JSON API Serializer. Makes sure
	 * that we do not return any non ServiceErrors
	 * to the client.
	 *
	 * @param err any type of error
	 */
	public static ensureServiceError(err: any): ServiceError {
		err = err || {};
		if (err instanceof ServiceError) {
			return err;
		}

		if (err.code) {
			return ErrorUtils.convertMongoErrorToServiceError(err);
		}

		if (!(err instanceof Error)) {
			err = new Error('Unknown error');
		}

		ErrorUtils.logger.error('Unknown error was raised', { err: err.stack });
		return new ServiceError(ERROR_TEMPLATES.INTERNAL_SERVER_ERROR, { meta: { message: `Unknown error was raised: ${err.message}` } });
	}

	/**
	 * This method convert a MongoError to an ServiceError when an error is thrown from MongoDB
	 * It will just return it untouched if we are not reading these specific mongo error codes.
	 * For a complete list of mongo error codes see: https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.err
	 *
	 * @param err the error assumed to be from MongoDB
	 */
	public static convertMongoErrorToServiceError(err: any, meta?: object) {
		switch (err.code) {
			case MONGO_ERRORS.DUPLICATE_KEY_ON_INSERT:
			case MONGO_ERRORS.DUPLICATE_KEY_ON_UPDATE:
				return new ServiceError(ERROR_TEMPLATES.CONFLICT, meta);
			case MONGO_ERRORS.KEY_TOO_LONG:
				meta = meta || { meta: { message: 'A value for an indexed property can be at most 1024 bytes in size' } };
				return new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, meta);
		}
		ErrorUtils.logger.error('Unknown Mongo error was raised', { err: err.stack });
		return new ServiceError(ERROR_TEMPLATES.INTERNAL_SERVER_ERROR, { meta: { message: `Unknown Mongo error was raised: ${err.message}` } });
	}
}
