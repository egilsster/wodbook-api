import * as _ from 'lodash';
import { ServiceError } from '../utils/service.error';
import { UID } from '../utils/uid';
import { ERROR_TEMPLATES } from '../utils/error.templates';
import { Base } from './base';

export class Resource extends Base {
	private _userId?: string;

	constructor(params) {
		super(params);
		this.userId = params.userId;
	}

	get userId() { return this._userId; }
	set userId(newUserId) {
		if (this._userId) {
			throw new ServiceError(ERROR_TEMPLATES.IMMUTABLE_PROPERTY, { source: { pointer: '/userId' } });
		} else if (newUserId) {
			if (UID.isValid(newUserId)) {
				this._userId = newUserId;
			} else {
				throw new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, { source: { pointer: '/userId' } });
			}
		}
	}
}
