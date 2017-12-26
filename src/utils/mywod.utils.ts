const scoreTypeMap = {
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

export class MywodUtils {
	public static mapDate(date: string | Date) {
		if (typeof date === 'string') {
			date = new Date(date);
		}
		return date;
	}

	public static mapWorkoutType(type: string) {
		return scoreTypeMap[type.trim()];
	}

	/**
	 * myWOD app uses numerical values for genders. I want to have it
	 * as a string value so I map it to its correct value here.
	 *
	 * @param value a numeric value for gender
	 */
	public static mapGender(value: number) {
		let mapped: string;
		switch (value) {
			case 0:
				mapped = 'female';
				break;
			case 1:
				mapped = 'male';
				break;
			default:
				mapped = 'other';
		}
		return mapped;
	}
}
