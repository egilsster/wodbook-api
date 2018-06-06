const HttpStatus = require('http-status-codes');
import { ExpressError } from '../utils/express.error';

const MONGO_ERROR_DUPLICATE_KEY_ON_INSERT = 11000;
const MONGO_ERROR_DUPLICATE_KEY_ON_UPDATE = 11001;
const MONGO_ERROR_KEY_TOO_LONG = 17280;

export class ErrorUtils {
	/**
	 * Used by the JSON API Serializer. Makes sure
	 * that we do not return any non ExpressErrors
	 * to the client.
	 *
	 * @param err any type of error
	 */
	public static ensureExpressError(err: any): ExpressError | ExpressError[] {
		err = err || {};
		if (ErrorUtils.isExpressError(err)) {
			return err;
		}

		if (ErrorUtils.isErrorWithErrors(err)) {
			return ErrorUtils.convertMongooseErrorToExpressErrors(err);
		}

		if (err.code) {
			return ErrorUtils.convertMongoErrorToExpressError(err);
		}
		const msg = err.message || 'Unknown error occurred';
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		return new ExpressError(msg, status);
	}

	/**
	 * This method convert a MongoError to an ExpressError when an error is thrown from MongoDB
	 * It will just return it untouched if we are not reading these specific mongo error codes.
	 * For a complete list of mongo error codes see: https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.err
	 *
	 * @param err the error assumed to be from MongoDB
	 */
	public static convertMongoErrorToExpressError(err: any) {
		let code = HttpStatus.INTERNAL_SERVER_ERROR;
		let msg = err.message || 'Unknown Mongo error occurred';
		switch (err.code) {
			case MONGO_ERROR_DUPLICATE_KEY_ON_INSERT:
			case MONGO_ERROR_DUPLICATE_KEY_ON_UPDATE:
				msg = 'A Resource with the same unique identity already exists';
				code = HttpStatus.CONFLICT;
				break;
			case MONGO_ERROR_KEY_TOO_LONG:
				msg = 'A value for an indexed property can be at most 1024 bytes in size';
				code = HttpStatus.UNPROCESSABLE_ENTITY;
				break;
			default:
				break;
		}
		return new ExpressError(msg, code);
	}

	/**
	 * Mongoose errors are formatted as an array of errors. Use this
	 * function to clean up the returned error by setting a status
	 * code and using the message from each error as the detail msg.
	 *
	 * @param mongooseErrors an object with error names as the key and the error as their values
	 * @param status status code to set on the ExpressError
	 */
	public static convertMongooseErrorToExpressErrors(mongooseErrors: { errors: { [key: string]: Error } }) {
		const errorObject = mongooseErrors.errors;
		return Object.keys(errorObject).map((key: string) => {
			const err = errorObject[key];
			const status = ErrorUtils.guessStatusCode(err);
			return new ExpressError(err.message, status);
		});
	}

	// #region helper utilities
	public static guessStatusCode(err: any) {
		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		if (err.$isValidatorError) {
			status = HttpStatus.UNPROCESSABLE_ENTITY;
		}
		return status;
	}

	public static isExpressError(err: any) {
		if (Array.isArray(err)) {
			err = err[0];
		}
		return err instanceof ExpressError;
	}

	public static isErrorWithErrors(error: any) {
		return Boolean(error && error.errors);
	}
	//#endregion
}
