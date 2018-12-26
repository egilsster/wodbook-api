import * as _ from 'lodash';
import { ServiceError } from './service.error';
import { ERROR_TEMPLATES } from './error.templates';

export const WORKOUT_MEASUREMENTS_MAP = {
	'For Time:': 'time',
	'For Distance:': 'distance',
	'For Load:': 'load',
	'For Repetitions:': 'repetitions',
	'For Rounds:': 'rounds',
	'For Timed Rounds:': 'timed_rounds',
	'Tabata Scoring:': 'tabata',
	'Total Score:': 'total',
	'No Score:': 'none'
};

/**
 * The index in the array represents the type in myWOD
 */
export const MOVEMENT_MEASUREMENTS = ['weight', 'distance', 'reps', 'height'];

export class MyWodUtils {
	public static mapWorkoutMeasurement(type: string) {
		return WORKOUT_MEASUREMENTS_MAP[type.trim()];
	}

	public static mapMovementMeasurement(type: number | string) {
		return MOVEMENT_MEASUREMENTS[type];
	}

	public static mapDate(date: string | Date) {
		if (typeof date === 'string') {
			return new Date(date);
		}
		return date;
	}

	public static getScoresForMovement(movement: any, movementScores: any[]) {
		const movementClientId = movement.primaryClientID;
		const movementId = movement.primaryRecordID;
		const movementType = MyWodUtils.mapMovementMeasurement(movement.type);

		const scores: any[] = [];
		for (const score of movementScores) {
			if (score.foreignMovementClientID === movementClientId && score.foreignMovementRecordID === movementId) {
				const scoreObject = MyWodUtils.adjustMovementScoreToMeasurement(movementType, score);
				scores.push(scoreObject);
			}
		}
		return scores;
	}

	public static adjustMovementScoreToMeasurement(movementType: string, score: any) {
		let res;
		const scoreObject = {
			score: score.measurementAValue,
			measurement: movementType,
			reps: Number(score.measurementB),
			notes: score.notes,
			createdAt: new Date(score.date)
		};
		switch (movementType) {
			case 'weight':
				res = _.merge(scoreObject, {
					sets: Number(score.sets)
				});
				break;
			case 'height':
				// Box jumps
				res = _.merge(scoreObject, {
					sets: Number(score.measurementB),
					reps: 1
				});
				break;
			case 'distance':
				// Rowing, running, etc
				res = _.merge(scoreObject, {
					score: score.measurementB,
					distance: score.measurementAValue,
					reps: null,
					sets: 1
				});
				break;
			case 'reps':
				res = _.merge(scoreObject, {
					reps: Number(score.measurementAValue),
					sets: Number(score.sets),
					score: null
				});
				break;
			default:
				throw new ServiceError(ERROR_TEMPLATES.INVALID_PROPERTY);
		}
		return res;
	}

	public static parseWorkoutScore(score: any): any {
		return {
			workoutId: score.workoutId,
			name: score.title,
			description: score.description,
			score: score.score,
			rx: Boolean(score.asPrescribed),
			measurement: MyWodUtils.mapWorkoutMeasurement(score.scoreType),
			notes: score.notes,
			userId: score.userId,
			createdAt: new Date(score.date)
		};
	}
}
