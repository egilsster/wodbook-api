import * as _ from 'lodash';
import * as url from 'url';
import * as querystring from 'querystring';

/**
 * Given a request URL, returns a sanitized version of the URL string with sensitive query parameter values masked.
 * @param url - string query parameter
 * @param sensitiveQueryParams - Sensitive query params to sanitize
 */
export function sanitizeQueryParams(originalUrl: string, sensitiveQueryParams: string[] = []) {
	const parsedUrl = url.parse(originalUrl);
	const query = parsedUrl.query;
	if (!_.isString(query) || _.isEmpty(query) || _.isEmpty(sensitiveQueryParams)) {
		return originalUrl;
	}
	const queryObj = querystring.parse(query);
	const queryKeys = _.keys(queryObj);
	queryKeys.forEach(key => {
		if (sensitiveQueryParams.findIndex(item => key.toLowerCase() === item.toLowerCase()) > -1) {
			if (_.isArray(queryObj[key])) {
				queryObj[key] = _.times(queryObj[key].length, (i) => `***MASKED${i + 1}***`);
			} else {
				queryObj[key] = '***MASKED***';
			}
		}
	});
	const sanitizedQueryParams = querystring.stringify(queryObj);

	return _.isEmpty(sanitizedQueryParams) ? originalUrl : url.format({
		...parsedUrl,
		search: sanitizedQueryParams
	});
}
