import * as _ from 'lodash';

/**
 * Removes any sensitive parameters from header object for logging purposes based on headerLoggingBlacklist.
 * @param headers - set of all HTTP headers for the request
 */
export function sanitizeHeaders(headers: object, headerLoggingBlacklist: string[] = ['authorization', 'cookie']) {
	if (!_.isArray(headerLoggingBlacklist)) {
		throw new Error('Invalid header blacklist supplied.');
	}
	headerLoggingBlacklist = _.map(headerLoggingBlacklist, (headerName) => {
		if (!_.isString(headerName)) {
			throw new Error(`Invalid header name: ${headerName}`);
		}
		return headerName.toLowerCase();
	});
	let toReturn = {};
	if (_.isObject(headers) && !_.isEmpty(headers)) {
		toReturn = _.pickBy(headers, (_val, key) => {
			return _.isString(key) && !_.includes(headerLoggingBlacklist, key.toLowerCase());
		});
	}
	return toReturn;
}
