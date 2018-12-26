import * as _ from 'lodash';
import { ServiceError } from '../utils/service.error';
import { UID } from '../utils/uid';
import { ERROR_TEMPLATES } from '../utils/error.templates';

export class Base {
	private _id!: string;
	private _createdAt!: Date;
	private _updatedAt!: Date;

	constructor(params) {
		this.id = params.id || params._id || UID.new();
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}

	get id() { return this._id; }
	set id(newId) {
		if (this._id) {
			throw new ServiceError(ERROR_TEMPLATES.IMMUTABLE_PROPERTY, { source: { pointer: '/id' } });
		} else if (UID.isValid(newId)) {
			this._id = newId;
		} else {
			throw new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, { source: { pointer: '/id' } });
		}
	}

	get createdAt() { return this._createdAt; }
	set createdAt(date) {
		if (!this._createdAt) {
			if (!_.isNil(date) && (_.isDate(date) || _.isString(date))) {
				this._createdAt = date;
			}
		}
		// throw new ServiceError(ERROR_TEMPLATES.IMMUTABLE_PROPERTY, { source: { pointer: '/createdAt' } });
	}

	get updatedAt() { return this._updatedAt; }
	set updatedAt(date) {
		if (!_.isNil(date) && (_.isDate(date) || _.isString(date))) {
			this._updatedAt = date;
		}
	}

	static validateRequiredFields(params: object, requiredFields: string[]) {
		const missingFields: string[] = [];
		for (let key of requiredFields) {
			if (!params[key]) {
				missingFields.push(key);
			}
		}
		if (!_.isEmpty(missingFields)) {
			throw new ServiceError(ERROR_TEMPLATES.MISSING_FIELDS, { meta: { missingFields, requiredFields } });
		}
	}
}
