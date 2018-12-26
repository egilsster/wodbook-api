import * as _ from 'lodash';
import { ServiceError } from '../utils/service.error';
import { Resource } from './resource';
import { ERROR_TEMPLATES } from '../utils/error.templates';
import { UID } from '../utils/uid';

export class WorkoutScore extends Resource {
	private _workoutId!: string;
	private _score!: string;
	private _rx!: boolean;
	private _measurement!: string;
	private _sets!: number;
	private _notes!: string;

	public static REQUIRED_FIELDS = ['workoutId', 'score', 'measurement'];
	public static ATTRIBUTES = [
		'id', 'workoutId', 'userId', 'score', 'rx', 'measurement', 'sets', 'notes', 'createdAt', 'updatedAt'
	];

	constructor(params) {
		super(params);
		WorkoutScore.validateRequiredFields(params, WorkoutScore.REQUIRED_FIELDS);
		this.score = params.score;
		this.rx = params.rx || false;
		this.measurement = params.measurement;
		this.sets = params.sets || 1; // Sets needed here?
		this.notes = params.notes;
		this.workoutId = params.workoutId;
	}

	get score() { return this._score; }
	set score(value) {
		if (_.isString(value)) {
			this._score = value.trim();
		} else {
			throw new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY, { source: { pointer: '/score' } });
		}
	}

	get rx() { return this._rx; }
	set rx(value) {
		if (_.isBoolean(value)) {
			this._rx = value;
		}
	}

	get measurement() { return this._measurement; }
	set measurement(value) {
		if (_.isString(value)) {
			this._measurement = value;
		}
	}

	get sets() { return this._sets; }
	set sets(value) {
		if (_.isNumber(value)) {
			this._sets = value;
		}
	}

	get notes() { return this._notes; }
	set notes(value) {
		if (_.isString(value)) {
			this._notes = value;
		}
	}

	get workoutId() { return this._workoutId; }
	set workoutId(value) {
		if (UID.isValid(value)) {
			this._workoutId = value;
		}
	}

	toObject() {
		return _.pick(this, WorkoutScore.ATTRIBUTES);
	}
}
