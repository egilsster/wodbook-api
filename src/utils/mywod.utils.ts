export class MywodUtils {
	public static SCORE_TYPES = {
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
	public static MOVEMENT_TYPES = ['weight', 'distance', 'reps', 'height'];

	public static mapDate(date: string | Date) {
		if (typeof date === 'string') {
			date = new Date(date);
		}
		return date;
	}

	public static mapWorkoutType(type: string) {
		return MywodUtils.SCORE_TYPES[type.trim()];
	}

	public static mapMovementType(type: number) {
		return MywodUtils.MOVEMENT_TYPES[type];
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

	public static getScoreForMovement(movement: any, movementSessions: any[]) {
		const movementClientId = movement.primaryClientID;
		const movementId = movement.primaryRecordID;

		const scores: any[] = [];
		for (const session of movementSessions) {
			if (session.foreignMovementClientID === movementClientId && session.foreignMovementRecordID === movementId) {
				scores.push({
					'score': session.measurementAValue,
					'type': MywodUtils.mapMovementType(movement.type),
					'sets': Number(session.sets),
					'notes': session.notes as string,
					'date': new Date(session.date)
				});
			}
		}

		return scores;
	}
}
