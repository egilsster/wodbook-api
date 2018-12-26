import * as _ from 'lodash';
import { ServiceError } from '../utils/service.error';
import { Resource } from './resource';
import { ERROR_TEMPLATES } from '../utils/error.templates';

const VALID_MOVEMENT_MEASURES = ['weight', 'distance', 'reps', 'height'];

export class Movement extends Resource {
	private _name!: string;
	private _measurement!: string;

	public static REQUIRED_FIELDS = ['name', 'measurement'];
	public static ATTRIBUTES = [
		'id', 'userId', 'name', 'measurement', 'createdAt', 'updatedAt'
	];

	constructor(params) {
		super(params);
		Movement.validateRequiredFields(params, Movement.REQUIRED_FIELDS);
		this.name = params.name;
		this.measurement = params.measurement;
	}

	get name() { return this._name; }
	set name(value) {
		if (Movement.isValidName(value)) {
			this._name = value.trim();
		} else {
			throw new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, { source: { pointer: '/name' } });
		}
	}

	get measurement() { return this._measurement; }
	set measurement(value) {
		if (Movement.isValidMeasure(value)) {
			this._measurement = value;
		} else {
			throw new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, { source: { pointer: '/measure' } });
		}
	}

	toObject() {
		return _.pick(this, Movement.ATTRIBUTES);
	}

	static isValidName(name: string) {
		return _.isString(name) && name.length <= 200;
	}

	static isValidMeasure(measure: string) {
		return _.isString(measure) && VALID_MOVEMENT_MEASURES.includes(measure);
	}
}
