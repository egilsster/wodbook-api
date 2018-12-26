import * as HttpStatus from 'http-status-codes';
import { Workout } from '../../src/models/workout';

describe('WorkoutModel', () => {
	describe('constructor', () => {
		it('should initialize new workout', () => {
			const workout = new Workout({
				name: 'Fran',
				measurement: 'time',
				description: '21/15/9 Thrusters and pullups',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
			});

			expect(workout.name).toEqual('Fran');
			expect(workout.measurement).toEqual('time');
		});

		it('should throw exception if name is invalid', () => {
			try {
				const workout = new Workout({
					id: 'invalidId',
					name: 'Workout'.repeat(50),
					measurement: 'time',
					userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				});
				expect(workout).toBeUndefined();
			} catch (err) {
				expect(err).toHaveProperty('status', HttpStatus.UNPROCESSABLE_ENTITY);
			}
		});

		it('should throw exception if fields are missing', () => {
			try {
				const workout = new Workout({
					id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				});
				expect(workout).toBeUndefined();
			} catch (err) {
				expect(err).toHaveProperty('status', HttpStatus.BAD_REQUEST);
			}
		});

		it('Can grab the id from _id', () => {
			const workout = new Workout({
				name: 'Workout',
				_id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				measurement: 'time',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
			});

			expect(workout.id).toEqual('rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8');
			expect(workout.name).toEqual('Workout');
		});
	});

	describe('getters / setters', () => {
		const immutableProps = {
			id: { validValue: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8', invalidValue: 'invalid' },
			userId: { validValue: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx', invalidValue: 'invalid' },
			createdAt: { validValue: new Date(), invalidValue: 'invalid' }
		};

		const properties = {
			name: { validValue: 'valid name', invalidValue: 123 },
			description: { validValue: 'description' },
			measurement: { validValue: 'time', invalidValue: 123 },
			global: { validValue: true },
			updatedAt: { validValue: new Date(), invalidValue: 123 },
		};
		let workout: Workout;

		beforeEach(() => {
			workout = new Workout({
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				name: 'Workout',
				description: 'description',
				measurement: 'time',
				global: true,
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			});
		});

		Object.keys(immutableProps).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(workout[key]).toBeDefined();
			});

			it(`${key} setter should throw an error when ${key} is already set`, () => {
				try {
					workout[key] = immutableProps[key].validValue;
				} catch (err) {
					expect(err.title).toMatch(/Immutable property/);
				}
			});

			it(`${key} setter should throw an error when value passed is invalid`, () => {
				// Un-set immutable property
				workout[`_${key}`] = undefined;
				try {
					workout[key] = immutableProps[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});

		Object.keys(properties).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(workout[key]).toBeDefined();
			});
			it(`${key} setter should set value`, () => {
				workout[key] = properties[key].validValue;
				expect(workout[key]).toEqual(properties[key].validValue);
				expect(workout[`_${key}`]).toEqual(properties[key].validValue);
			});
			it(`${key} setter should throw an error when value passed is invalid`, () => {
				try {
					workout[key] = properties[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});
	});

	describe('toObject', () => {
		it('should return an object with the workout properties', () => {
			const workout = {
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				name: 'Workout',
				measurement: 'time',
				description: 'description',
				global: true,
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			};

			let newWorkout = new Workout(workout);
			expect(workout).toEqual(newWorkout.toObject());
		});
	});
});