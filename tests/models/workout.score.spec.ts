import * as HttpStatus from 'http-status-codes';
import { WorkoutScore } from '../../src/models/workout.score';

describe('WorkoutScoreModel', () => {
	describe('constructor', () => {
		it('should initialize new workout score', () => {
			const workoutScore = new WorkoutScore({
				score: '1:00',
				measurement: 'time',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				workoutId: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8'
			});

			expect(workoutScore.measurement).toEqual('time');
		});

		it('should throw exception if fields are missing', () => {
			try {
				const workoutScore = new WorkoutScore({
					id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				});
				expect(workoutScore).toBeUndefined();
			} catch (err) {
				expect(err).toHaveProperty('status', HttpStatus.BAD_REQUEST);
			}
		});

		it('Can grab the id from _id', () => {
			const workoutScore = new WorkoutScore({
				_id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				score: '1:00',
				measurement: 'time',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				workoutId: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8'
			});

			expect(workoutScore.id).toEqual('rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8');
			expect(workoutScore.score).toEqual('1:00');
		});
	});

	describe('getters / setters', () => {
		const immutableProps = {
			id: { validValue: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8', invalidValue: 'invalid' },
			userId: { validValue: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx', invalidValue: 'invalid' },
			createdAt: { validValue: new Date(), invalidValue: 'invalid' }
		};

		const properties = {
			score: { validValue: '1:00', invalidValue: null },
			rx: { validValue: true, invalidValue: '100' },
			measurement: { validValue: 'time', invalidValue: 123 },
			notes: { validValue: 'notes', invalidValue: false },
			sets: { validValue: 1, invalidValue: false },
			workoutId: { validValue: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8', invalidValue: 'invalid' },
			updatedAt: { validValue: new Date(), invalidValue: 123 },
		};
		let workoutScore: WorkoutScore;

		beforeEach(() => {
			workoutScore = new WorkoutScore({
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				score: '1:00',
				measurement: 'time',
				notes: 'notes',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				workoutId: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			});
		});

		Object.keys(immutableProps).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(workoutScore[key]).toBeDefined();
			});

			it(`${key} setter should throw an error when ${key} is already set`, () => {
				try {
					workoutScore[key] = immutableProps[key].validValue;
				} catch (err) {
					expect(err.title).toMatch(/Immutable property/);
				}
			});

			it(`${key} setter should throw an error when value passed is invalid`, () => {
				// Un-set immutable property
				workoutScore[`_${key}`] = undefined;
				try {
					workoutScore[key] = immutableProps[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});

		Object.keys(properties).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(workoutScore[key]).toBeDefined();
			});
			it(`${key} setter should set value`, () => {
				workoutScore[key] = properties[key].validValue;
				expect(workoutScore[key]).toEqual(properties[key].validValue);
				expect(workoutScore[`_${key}`]).toEqual(properties[key].validValue);
			});
			it(`${key} setter should throw an error when value passed is invalid`, () => {
				try {
					workoutScore[key] = properties[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});
	});

	describe('toObject', () => {
		it('should return an object with the workout score properties', () => {
			const workoutScore = {
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				workoutId: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				score: '1:00',
				sets: 1,
				notes: 'Good day',
				rx: true,
				measurement: 'time',
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			};

			let newWorkoutScore = new WorkoutScore(workoutScore);
			expect(workoutScore).toEqual(newWorkoutScore.toObject());
		});
	});
});
