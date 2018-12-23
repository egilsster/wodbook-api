export class MyWodUtils {
	public static WORKOUT_MEASUREMENTS = {
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
	public static MOVEMENT_MEASUREMENTS = ['weight', 'distance', 'reps', 'height'];

	public static mapWorkoutMeasurement(type: string) {
		return MyWodUtils.WORKOUT_MEASUREMENTS[type.trim()];
	}

	public static mapMovementMeasurement(type: number | string) {
		return MyWodUtils.MOVEMENT_MEASUREMENTS[type];
	}

	public static mapDate(date: string | Date) {
		if (typeof date === 'string') {
			return new Date(date);
		}
		return date;
	}

	/**
	 * myWOD app uses numerical values for genders. I want to have it
	 * as a string value so I map it to its correct value here.
	 *
	 * @param value a numeric value for gender
	 */
	public static mapGender(value: number | string) {
		if (typeof value === 'number') {
			switch (value) {
				case 0:
					value = 'female';
					break;
				case 1:
					value = 'male';
					break;
				default:
					value = 'other';
			}
		}
		return value;
	}

	public static getScoresForMovement(movement: any, movementScores: any[]) {
		const movementClientId = movement.primaryClientID;
		const movementId = movement.primaryRecordID;

		const scores: any[] = [];
		for (const score of movementScores) {
			if (score.foreignMovementClientID === movementClientId && score.foreignMovementRecordID === movementId) {
				scores.push({
					score: score.measurementAValue,
					measurement: MyWodUtils.mapMovementMeasurement(movement.type),
					sets: score.sets,
					notes: score.notes,
					createdAt: new Date(score.date)
				});
			}
		}

		return scores;
	}

	public static parseWorkoutScore(score: any) {
		return {
			workoutId: score.workoutId,
			workoutTitle: score.title,
			description: score.description,
			score: score.score,
			rx: Boolean(score.asPrescribed),
			measurement: MyWodUtils.mapWorkoutMeasurement(score.scoreType),
			notes: score.notes,
			createdAt: new Date(score.date)
		};
	}
}
