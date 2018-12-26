import * as _ from 'lodash';
import { ServiceError } from '../utils/service.error';
import { Resource } from './resource';
import { ERROR_TEMPLATES } from '../utils/error.templates';

const VALID_WORKOUT_MEASURES = ['time', 'distance', 'load', 'repetitions', 'rounds', 'timed_rounds', 'tabata', 'total', 'none'];

export class Workout extends Resource {
	private _name!: string;
	private _measurement!: string;
	private _description!: string;
	private _global!: boolean;

	public static REQUIRED_FIELDS = ['name', 'measurement'];
	public static ATTRIBUTES = [
		'id', 'userId', 'name', 'measurement', 'description', 'global', 'createdAt', 'updatedAt'
	];

	constructor(params) {
		super(params);
		Workout.validateRequiredFields(params, Workout.REQUIRED_FIELDS);
		this.name = params.name;
		this.measurement = params.measurement;
		this.description = params.description || '';
		this.global = params.global || false;
	}

	get name() { return this._name; }
	set name(value) {
		if (Workout.isValidName(value)) {
			this._name = value.trim();
		} else {
			throw new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, { source: { pointer: '/name' } });
		}
	}

	get measurement() { return this._measurement; }
	set measurement(value) {
		if (Workout.isValidMeasure(value)) {
			this._measurement = value;
		} else {
			throw new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, { source: { pointer: '/measurement' } });
		}
	}

	get description() { return this._description; }
	set description(value) {
		if (_.isString(value)) {
			this._description = value;
		}
	}

	get global() { return this._global; }
	set global(value) {
		if (_.isBoolean(value)) {
			this._global = value;
		}
	}

	toObject() {
		return _.pick(this, Workout.ATTRIBUTES);
	}

	static isValidName(name) {
		return _.isString(name) && name.length <= 200;
	}

	static isValidMeasure(measure: string) {
		return _.isString(measure) && VALID_WORKOUT_MEASURES.includes(measure);
	}
}
