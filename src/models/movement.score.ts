import * as _ from 'lodash';
import { Resource } from './resource';
import { UID } from '../utils/uid';

export class MovementScore extends Resource {
	private _movementId!: string;
	private _score!: number | string;
	private _measurement!: string;
	private _sets!: number;
	private _reps!: number;
	private _distance!: number;
	private _notes!: string;

	public static REQUIRED_FIELDS = ['movementId', 'measurement'];
	public static ATTRIBUTES = [
		'id', 'movementId', 'userId', 'score', 'measurement', 'sets', 'reps', 'distance', 'notes', 'createdAt', 'updatedAt'
	];

	constructor(params) {
		super(params);
		MovementScore.validateRequiredFields(params, MovementScore.REQUIRED_FIELDS);
		this.score = params.score;
		this.measurement = params.measurement;
		this.sets = params.sets || 1;
		this.reps = params.reps || 1;
		this.distance = params.distance;
		this.notes = params.notes;
		this.movementId = params.movementId;
	}

	get score() { return this._score; }
	set score(value) {
		if (_.isNumber(value) || _.isString(value)) {
			this._score = value;
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

	get reps() { return this._reps; }
	set reps(value) {
		if (_.isNumber(value)) {
			this._reps = value;
		}
	}

	get distance() { return this._distance; }
	set distance(value) {
		if (_.isNumber(value)) {
			this._distance = value;
		}
	}

	get notes() { return this._notes; }
	set notes(value) {
		if (_.isString(value)) {
			this._notes = value;
		}
	}

	get movementId() { return this._movementId; }
	set movementId(value) {
		if (UID.isValid(value)) {
			this._movementId = value;
		}
	}

	toObject() {
		return _.pick(this, MovementScore.ATTRIBUTES);
	}
}
