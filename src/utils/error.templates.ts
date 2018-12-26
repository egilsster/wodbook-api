import * as HttpStatus from 'http-status-codes';

export const ERROR_TEMPLATES = Object.freeze({
	INVALID_PAYLOAD: {
		status: HttpStatus.BAD_REQUEST,
		title: 'Payload could not be processed'
	},
	INVALID_JWT: {
		status: HttpStatus.BAD_REQUEST,
		title: 'Missing configuration values'
	},
	MISSING_FIELDS: {
		status: HttpStatus.BAD_REQUEST,
		title: 'Missing required fields'
	},
	IMMUTABLE_PROPERTY: {
		status: HttpStatus.BAD_REQUEST,
		title: 'Immutable property'
	},
	UNAUTHORIZED: {
		status: HttpStatus.UNAUTHORIZED,
		title: 'Unauthorized'
	},
	FORBIDDEN: {
		status: HttpStatus.FORBIDDEN,
		title: 'Forbidden'
	},
	NOT_FOUND: {
		status: HttpStatus.NOT_FOUND,
		title: 'Not found'
	},
	UNSUPPORTED_MEDIA_TYPE: {
		status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
		title: 'Only multipart requests are supported for this method'
	},
	CONFLICT: {
		status: HttpStatus.CONFLICT,
		title: 'Conflict'
	},
	GONE: {
		status: HttpStatus.GONE,
		title: 'Gone'
	},
	INVALID_REQUEST_FORMAT: {
		status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
		title: 'Request body must be a valid JSON object'
	},
	INVALID_PROPERTY: {
		status: HttpStatus.UNPROCESSABLE_ENTITY,
		title: 'Invalid property value'
	},
	INVALID_FILE: {
		status: HttpStatus.UNPROCESSABLE_ENTITY,
		title: 'File could not be processed'
	},
	UPLOAD_FAILED: {
		status: HttpStatus.SERVICE_UNAVAILABLE,
		title: 'File could not be uploaded'
	},
	INTERNAL_SERVER_ERROR: {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		title: 'Internal server error'
	},
	BAD_GATEWAY: {
		status: HttpStatus.BAD_GATEWAY,
		title: 'Bad gateway'
	}
});
