import * as _ from 'lodash';
import { ServiceError } from '../utils/service.error';
import { Base } from './base';
import { ERROR_TEMPLATES } from '../utils/error.templates';

export class User extends Base {
	private _email!: string;
	private _password!: string;
	private _admin!: boolean;
	private _firstName?: string;
	private _lastName?: string;
	private _dateOfBirth?: Date;
	private _height?: number;
	private _weight?: number;
	private _boxName?: string;
	private _avatarUrl?: string;

	public static REQUIRED_FIELDS = ['email', 'password'];
	public static ATTRIBUTES = [
		'id', 'admin', 'email', 'firstName', 'lastName', 'dateOfBirth',
		'height', 'weight', 'boxName', 'avatarUrl', 'createdAt', 'updatedAt'
	];

	constructor(params) {
		super(params);
		User.validateRequiredFields(params, User.REQUIRED_FIELDS);
		this.email = params.email;
		this.password = params.password;
		this.admin = params.admin || false;
		this.firstName = params.firstName;
		this.lastName = params.lastName;
		this.dateOfBirth = params.dateOfBirth;
		this.height = params.height;
		this.weight = params.weight;
		this.boxName = params.boxName;
		this.avatarUrl = params.avatarUrl;
	}

	get email() { return this._email; }
	set email(value) {
		if (User.isValidEmail(value)) {
			this._email = value.trim();
		} else {
			throw new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, { source: { pointer: '/email' } });
		}
	}

	get password() { return this._password; }
	set password(value) {
		if (_.isString(value)) {
			this._password = value;
		} else {
			throw new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, { source: { pointer: '/password' } });
		}
	}

	get admin() { return this._admin; }
	set admin(value) {
		if (_.isBoolean(value)) {
			this._admin = value;
		}
	}

	get firstName() { return this._firstName; }
	set firstName(value) {
		if (_.isString(value)) {
			this._firstName = value;
		}
	}

	get lastName() { return this._lastName; }
	set lastName(value) {
		if (_.isString(value)) {
			this._lastName = value;
		}
	}

	get dateOfBirth() { return this._dateOfBirth; }
	set dateOfBirth(value) {
		if (_.isDate(value) || _.isString(value)) {
			this._dateOfBirth = value;
		}
	}

	get height() { return this._height; }
	set height(value) {
		if (_.isNumber(value)) {
			this._height = value;
		}
	}

	get weight() { return this._weight; }
	set weight(value) {
		if (_.isNumber(value)) {
			this._weight = value;
		}
	}

	get boxName() { return this._boxName; }
	set boxName(value) {
		if (_.isString(value)) {
			this._boxName = value;
		}
	}

	get avatarUrl() { return this._avatarUrl; }
	set avatarUrl(value) {
		if (_.isString(value)) {
			this._avatarUrl = value;
		}
	}

	toObject() {
		return _.pick(this, User.ATTRIBUTES);
	}

	static isValidEmail(email) {
		// Validate
		return _.isString(email) && email.length <= 200;
	}
}
