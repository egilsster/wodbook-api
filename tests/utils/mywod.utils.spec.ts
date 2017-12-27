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

	describe('mapWorkoutType', () => {
		it('should map workout based on myWOD string', () => {
			expect(MywodUtils.mapWorkoutType('For Time:')).toEqual('time');
			expect(MywodUtils.mapWorkoutType('For Distance:')).toEqual('distance');
			expect(MywodUtils.mapWorkoutType('No Score:')).toEqual('none');
		});
	});

	describe('mapMovementType', () => {
		it('should map movement measurement based on myWOD numerical values', () => {
			expect(MywodUtils.mapMovementType(0)).toEqual('weight');
			expect(MywodUtils.mapMovementType(1)).toEqual('distance');
			expect(MywodUtils.mapMovementType(2)).toEqual('reps');
			expect(MywodUtils.mapMovementType(3)).toEqual('height');
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

	describe('getScoreForMovement', () => {
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
				'primaryRecordID': 5,
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

		const movementSessions = [
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
			const session = movementSessions[0];

			const scores = MywodUtils.getScoreForMovement(movement, movementSessions);

			expect(scores.length).toEqual(1);
			expect(scores[0]).toHaveProperty('score', 7);
			expect(scores[0]).toHaveProperty('type', 'reps');
			expect(scores[0]).toHaveProperty('sets', 1);
			expect(scores[0]).toHaveProperty('notes');
			expect(scores[0]).toHaveProperty('date', new Date(session.date));
		});
	});
});
