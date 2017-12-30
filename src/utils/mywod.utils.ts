export class MywodUtils {
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

	public static mapDate(date: string | Date) {
		if (typeof date === 'string') {
			date = new Date(date);
		}
		return date;
	}

	public static mapWorkoutMeasurement(type: string) {
		return MywodUtils.WORKOUT_MEASUREMENTS[type.trim()];
	}

	public static mapMovementMeasurement(type: number) {
		return MywodUtils.MOVEMENT_MEASUREMENTS[type];
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
					'score': score.measurementAValue,
					'measurement': movement.type,
					'sets': score.sets,
					'notes': score.notes,
					'date': score.date
				});
			}
		}

		return scores;
	}

	public static parseWorkoutScore(score: any) {
		return {
			'workoutTitle': score.title,
			'description': score.description,
			'score': score.score,
			'rx': Boolean(score.asPrescribed),
			'measurement': score.scoreType,
			'notes': score.notes,
			'date': score.date,
		};
	}
}
