import * as uid from 'uid-safe';

export class UID {
	/**
	 * Creates a UID. Byte Length is 24.
	 * @returns a new uid
	 */
	static new() {
		return uid.sync(24);
	}

	static isValid(id: string) {
		if (typeof id !== 'string') {
			throw new TypeError('UUID has to be a string');
		}
		return /^[A-Za-z0-9-_]{32}$/.test(id);
	}
}
