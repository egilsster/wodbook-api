import * as HttpStatus from 'http-status-codes';
import { MovementScore } from '../../src/models/movement.score';

describe('MovementScoreModel', () => {
	describe('constructor', () => {
		it('should initialize new movement score', () => {
			const movementScore = new MovementScore({
				score: 100,
				sets: 1,
				measurement: 'weight',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				movementId: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8'
			});

			expect(movementScore.measurement).toEqual('weight');
		});

		it('should throw exception if fields are missing', () => {
			try {
				const movementScore = new MovementScore({
					id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				});
				expect(movementScore).toBeUndefined();
			} catch (err) {
				expect(err).toHaveProperty('status', HttpStatus.BAD_REQUEST);
			}
		});

		it('Can grab the id from _id', () => {
			const movementScore = new MovementScore({
				_id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				score: 100,
				sets: 1,
				measurement: 'weight',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				movementId: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8'
			});

			expect(movementScore.id).toEqual('rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8');
			expect(movementScore.score).toEqual(100);
		});
	});

	describe('getters / setters', () => {
		const immutableProps = {
			id: { validValue: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8', invalidValue: 'invalid' },
			userId: { validValue: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx', invalidValue: 'invalid' },
			createdAt: { validValue: new Date(), invalidValue: 'invalid' }
		};

		const properties = {
			score: { validValue: 100, invalidValue: null },
			measurement: { validValue: 'weight', invalidValue: 123 },
			sets: { validValue: 1, invalidValue: null },
			reps: { validValue: 1, invalidValue: '1' },
			distance: { validValue: 1000, invalidValue: '1000' },
			notes: { validValue: 'notes', invalidValue: false },
			movementId: { validValue: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8', invalidValue: 'invalid' },
			updatedAt: { validValue: new Date(), invalidValue: 123 },
		};
		let movementScore: MovementScore;

		beforeEach(() => {
			movementScore = new MovementScore({
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				score: 100,
				distance: 1000,
				measurement: 'weight',
				notes: 'notes',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				movementId: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			});
		});

		Object.keys(immutableProps).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(movementScore[key]).toBeDefined();
			});

			it(`${key} setter should throw an error when ${key} is already set`, () => {
				try {
					movementScore[key] = immutableProps[key].validValue;
				} catch (err) {
					expect(err.title).toMatch(/Immutable property/);
				}
			});

			it(`${key} setter should throw an error when value passed is invalid`, () => {
				// Un-set immutable property
				movementScore[`_${key}`] = undefined;
				try {
					movementScore[key] = immutableProps[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});

		Object.keys(properties).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(movementScore[key]).toBeDefined();
			});
			it(`${key} setter should set value`, () => {
				movementScore[key] = properties[key].validValue;
				expect(movementScore[key]).toEqual(properties[key].validValue);
				expect(movementScore[`_${key}`]).toEqual(properties[key].validValue);
			});
			it(`${key} setter should throw an error when value passed is invalid`, () => {
				try {
					movementScore[key] = properties[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});
	});

	describe('toObject', () => {
		it('should return an object with the movement score properties', () => {
			const movementScore = {
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				movementId: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				score: 100,
				sets: 1,
				reps: 1,
				notes: 'Good day',
				measurement: 'weight',
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			};

			let newMovementScore = new MovementScore(movementScore);
			expect(movementScore).toEqual(newMovementScore.toObject());
		});
	});
});
