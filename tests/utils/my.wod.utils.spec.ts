import * as _ from 'lodash';
import { MyWodUtils } from '../../src/utils/my.wod.utils';

describe('MywodUtils', () => {
	describe('mapWorkoutMeasurement', () => {
		it('should map workout based on myWOD string', () => {
			expect(MyWodUtils.mapWorkoutMeasurement('For Time:')).toEqual('time');
			expect(MyWodUtils.mapWorkoutMeasurement('For Distance:')).toEqual('distance');
			expect(MyWodUtils.mapWorkoutMeasurement('No Score:')).toEqual('none');
		});
	});

	describe('mapMovementMeasurement', () => {
		it('should map movement measurement based on myWOD numerical values', () => {
			expect(MyWodUtils.mapMovementMeasurement(0)).toEqual('weight');
			expect(MyWodUtils.mapMovementMeasurement(1)).toEqual('distance');
			expect(MyWodUtils.mapMovementMeasurement(2)).toEqual('reps');
			expect(MyWodUtils.mapMovementMeasurement(3)).toEqual('height');
		});
	});

	describe('mapDate', () => {
		it('should parse date string to a date', () => {
			const res = MyWodUtils.mapDate('01-01-2018');
			expect(res.toISOString().startsWith('2018-01-01')).toBe(true);
		});

		it('should return date if parameter is not a string', () => {
			const date = new Date();
			const res = MyWodUtils.mapDate(date);
			expect(res).toEqual(date);
		});
	});

	describe('adjustMovementScoreToMeasurement', () => {
		it(`should modify properties for "weight"`, () => {
			const weightScore = {
				measurement: 'weight',
				measurementAValue: 70,
				measurementB: '1',
				sets: '1',
				notes: '',
			};
			const res = MyWodUtils.adjustMovementScoreToMeasurement('weight', weightScore);
			expect(res).toHaveProperty('score', 70);
			expect(res).toHaveProperty('sets', 1);
			expect(res).toHaveProperty('reps', 1);
		});

		it(`should modify properties for "height"`, () => {
			const weightScore = {
				measurementAValue: 126,
				measurementB: '1',
				sets: '1',
				notes: ''
			};
			const res = MyWodUtils.adjustMovementScoreToMeasurement('height', weightScore);
			expect(res).toHaveProperty('score', 126);
			expect(res).toHaveProperty('sets', 1);
			expect(res).toHaveProperty('reps', 1);
		});

		it(`should modify properties for "distance"`, () => {
			const weightScore = {
				measurement: 'distance',
				measurementAValue: 1000,
				measurementB: '2:50',
				sets: '1',
				notes: '',
			};
			const res = MyWodUtils.adjustMovementScoreToMeasurement('distance', weightScore);
			expect(res).toHaveProperty('score', '2:50');
			expect(res).toHaveProperty('distance', 1000);
			expect(res).toHaveProperty('sets', 1);
			expect(res).toHaveProperty('reps', null);
		});

		it(`should modify properties for "reps"`, () => {
			const repsScore = {
				measurementAValue: 7,
				measurementB: '0:00',
				sets: '1',
				notes: ''
			};
			const res = MyWodUtils.adjustMovementScoreToMeasurement('reps', repsScore);
			expect(res).toHaveProperty('score', null);
			expect(res).toHaveProperty('sets', 1);
			expect(res).toHaveProperty('reps', 7);
		});

		it(`should throw error for invalid type`, () => {
			expect(() => MyWodUtils.adjustMovementScoreToMeasurement('foo', {})).toThrow();
		});
	});

	describe('parseWorkoutScore', () => {
		it('should parse myWOD workout score to correct object', () => {
			const score = {
				primaryClientID: 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				primaryRecordID: 1,
				hasChangesForServer: 0,
				parseId: 'OPssEL9w2Q',
				title: '181017',
				date: '2017-11-18',
				scoreType: 'For Time:',
				score: '14:20',
				personalRecord: 1,
				asPrescribed: 1,
				description: '5 rounds:\n15 ft rope climb, 3 ascents,\n10 toes-to-bar,\n21 walking lunges with 20.4/13.6kg plate overhead,\n400 meter run',
				notes: '',
				heartRate: 'NA',
				deleted: 0
			};

			const res = MyWodUtils.parseWorkoutScore(score);
			expect(res).toHaveProperty('name', score.title);
			expect(res).toHaveProperty('description', score.description);
			expect(res).toHaveProperty('score', score.score);
			expect(res).toHaveProperty('rx', Boolean(score.asPrescribed));
			expect(res).toHaveProperty('measurement');
			expect(res).toHaveProperty('notes', score.notes);
			expect(res).toHaveProperty('createdAt', new Date(score.date));
		});
	});

	describe('getScoresForMovement', () => {
		const movements = [
			{
				primaryClientID: 'initial',
				primaryRecordID: 1,
				hasChangesForServer: 1,
				parseId: null,
				name: 'Thruster',
				type: 0,
				everModifiedByAthlete: 0,
				deleted: 0
			},
			{
				primaryClientID: 'initial',
				primaryRecordID: 3,
				hasChangesForServer: 1,
				parseId: null,
				name: 'Snatch',
				type: 0,
				everModifiedByAthlete: 0,
				deleted: 0
			},
			{
				primaryClientID: 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				primaryRecordID: 5,
				hasChangesForServer: 1,
				parseId: null,
				name: 'HSPU',
				type: 2,
				everModifiedByAthlete: 1,
				deleted: 0
			}
		];

		const movementScores = [
			{
				primaryClientID: 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				primaryRecordID: 50,
				foreignMovementClientID: 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				foreignMovementRecordID: 5,
				hasChangesForServer: 1,
				parseId: null,
				date: '2017-11-07',
				measurementAValue: 7,
				measurementAUnitsCode: 8,
				measurementB: '0:00',
				sets: '1',
				notes: '',
				deleted: 0
			},
			{
				primaryClientID: 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				primaryRecordID: 44,
				foreignMovementClientID: 'initial',
				foreignMovementRecordID: 3,
				hasChangesForServer: 1,
				parseId: null,
				date: '2017-04-11',
				measurementAValue: 70,
				measurementAUnitsCode: 1,
				measurementB: '1',
				sets: '1',
				notes: '',
				deleted: 0
			}
		];

		it('should find scores for movement', () => {
			const movement = movements[2];

			const scores = MyWodUtils.getScoresForMovement(movement, movementScores);

			expect(scores.length).toEqual(1);
			const firstScore = _.omit(scores[0], ['createdAt']);
			expect(firstScore).toEqual({
				measurement: 'reps',
				notes: '',
				reps: 7,
				score: null,
				sets: 1
			});
		});
	});
});
