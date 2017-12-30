import { MywodUtils } from '../../src/utils/mywod.utils';

describe('MywodUtils', () => {
	describe('mapDate', () => {
		it('should parse date string to a date', () => {
			const res = MywodUtils.mapDate('01-01-2018');
			expect(res.toISOString().startsWith('2018-01-01')).toBe(true);
		});

		it('should return date if parameter is not a string', () => {
			const date = new Date();
			const res = MywodUtils.mapDate(date);
			expect(res).toEqual(date);
		});
	});

	describe('mapWorkoutMeasurement', () => {
		it('should map workout based on myWOD string', () => {
			expect(MywodUtils.mapWorkoutMeasurement('For Time:')).toEqual('time');
			expect(MywodUtils.mapWorkoutMeasurement('For Distance:')).toEqual('distance');
			expect(MywodUtils.mapWorkoutMeasurement('No Score:')).toEqual('none');
		});
	});

	describe('mapMovementMeasurement', () => {
		it('should map movement measurement based on myWOD numerical values', () => {
			expect(MywodUtils.mapMovementMeasurement(0)).toEqual('weight');
			expect(MywodUtils.mapMovementMeasurement(1)).toEqual('distance');
			expect(MywodUtils.mapMovementMeasurement(2)).toEqual('reps');
			expect(MywodUtils.mapMovementMeasurement(3)).toEqual('height');
		});
	});

	describe('mapGender', () => {
		it('should map valid numerical values to its appropriate string value', () => {
			const genders = ['female', 'male', 'other'];

			for (let i = 0; i < genders.length; ++i) {
				const gender = genders[i];
				const res = MywodUtils.mapGender(i);
				expect(res).toEqual(gender);
			}
		});

		it(`should get 'other' if numerical value does not map to female or male`, () => {
			const res = MywodUtils.mapGender(3);
			expect(res).toEqual('other');
		});

		it('should return value unchanged if it is not a number', () => {
			const gender = 'male';
			const res = MywodUtils.mapGender(gender);
			expect(res).toEqual(gender);
		});
	});

	describe('parseWorkoutScore', () => {
		it('should parse myWOD workout score to correct object', () => {
			const score = {
				'primaryClientID': 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				'primaryRecordID': 1,
				'hasChangesForServer': 0,
				'parseId': 'OPssEL9w2Q',
				'title': '181017',
				'date': '2017-11-18',
				'scoreType': 'For Time:',
				'score': '14:20',
				'personalRecord': 1,
				'asPrescribed': 1,
				'description': '5 rounds:\n15 ft rope climb, 3 ascents,\n10 toes-to-bar,\n21 walking lunges with 20.4/13.6kg plate overhead,\n400 meter run',
				'notes': '',
				'heartRate': 'NA',
				'deleted': 0
			};

			const res = MywodUtils.parseWorkoutScore(score);
			expect(res).toHaveProperty('workoutTitle', score.title);
			expect(res).toHaveProperty('description', score.description);
			expect(res).toHaveProperty('score', score.score);
			expect(res).toHaveProperty('rx', Boolean(score.asPrescribed));
			expect(res).toHaveProperty('measurement');
			expect(res).toHaveProperty('notes', score.notes);
			expect(res).toHaveProperty('date', score.date);
		});
	});

	describe('getScoresForMovement', () => {
		const movements = [
			{
				'primaryClientID': 'initial',
				'primaryRecordID': 1,
				'hasChangesForServer': 1,
				'parseId': null,
				'name': 'Thruster',
				'type': 0,
				'everModifiedByAthlete': 0,
				'deleted': 0
			},
			{
				'primaryClientID': 'initial',
				'primaryRecordID': 3,
				'hasChangesForServer': 1,
				'parseId': null,
				'name': 'Snatch',
				'type': 0,
				'everModifiedByAthlete': 0,
				'deleted': 0
			},
			{
				'primaryClientID': 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				'primaryRecordID': 5,
				'hasChangesForServer': 1,
				'parseId': null,
				'name': 'HSPU',
				'type': 2,
				'everModifiedByAthlete': 1,
				'deleted': 0
			}
		];

		const movementScores = [
			{
				'primaryClientID': 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				'primaryRecordID': 50,
				'foreignMovementClientID': 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				'foreignMovementRecordID': 5,
				'hasChangesForServer': 1,
				'parseId': null,
				'date': '2017-11-07',
				'measurementAValue': 7,
				'measurementAUnitsCode': 8,
				'measuermentB': '0:00',
				'sets': '1',
				'notes': '',
				'deleted': 0
			},
			{
				'primaryClientID': 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				'primaryRecordID': 44,
				'foreignMovementClientID': 'initial',
				'foreignMovementRecordID': 3,
				'hasChangesForServer': 1,
				'parseId': null,
				'date': '2017-04-11',
				'measurementAValue': 70,
				'measurementAUnitsCode': 1,
				'measuermentB': '1',
				'sets': '1',
				'notes': '',
				'deleted': 0
			}
		];

		it('should find scores for movement', () => {
			const movement = movements[2];
			const session = movementScores[0];

			const scores = MywodUtils.getScoresForMovement(movement, movementScores);

			expect(scores.length).toEqual(1);
			expect(scores[0]).toHaveProperty('score', 7);
			expect(scores[0]).toHaveProperty('measurement', 2);
			expect(scores[0]).toHaveProperty('sets', '1');
			expect(scores[0]).toHaveProperty('notes');
			expect(scores[0]).toHaveProperty('date', session.date);
		});
	});
});
