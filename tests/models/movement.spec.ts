import * as HttpStatus from 'http-status-codes';
import { Movement } from '../../src/models/movement';

describe('MovementModel', () => {
	describe('constructor', () => {
		it('should initialize new movement', () => {
			const movement = new Movement({
				name: 'Snatch',
				measurement: 'weight',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
			});

			expect(movement.name).toEqual('Snatch');
			expect(movement.measurement).toEqual('weight');
		});

		it('should throw exception if name is invalid', () => {
			try {
				const movement = new Movement({
					id: 'invalidId',
					name: 'Movement'.repeat(50),
					measurement: 'weight',
					userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				});
				expect(movement).toBeUndefined();
			} catch (err) {
				expect(err).toHaveProperty('status', HttpStatus.UNPROCESSABLE_ENTITY);
			}
		});

		it('should throw exception if fields are missing', () => {
			try {
				const movement = new Movement({
					id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				});
				expect(movement).toBeUndefined();
			} catch (err) {
				expect(err).toHaveProperty('status', HttpStatus.BAD_REQUEST);
			}
		});

		it('Can grab the id from _id', () => {
			const movement = new Movement({
				name: 'Movement',
				_id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				measurement: 'weight',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
			});

			expect(movement.id).toEqual('rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8');
			expect(movement.name).toEqual('Movement');
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
			measurement: { validValue: 'weight', invalidValue: 123 },
			updatedAt: { validValue: new Date(), invalidValue: 123 },
		};
		let movement: Movement;

		beforeEach(() => {
			movement = new Movement({
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				name: 'Movement',
				measurement: 'weight',
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			});
		});

		Object.keys(immutableProps).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(movement[key]).toBeDefined();
			});

			it(`${key} setter should throw an error when ${key} is already set`, () => {
				try {
					movement[key] = immutableProps[key].validValue;
				} catch (err) {
					expect(err.title).toMatch(/Immutable property/);
				}
			});

			it(`${key} setter should throw an error when value passed is invalid`, () => {
				// Un-set immutable property
				movement[`_${key}`] = undefined;
				try {
					movement[key] = immutableProps[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});

		Object.keys(properties).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(movement[key]).toBeDefined();
			});
			it(`${key} setter should set value`, () => {
				movement[key] = properties[key].validValue;
				expect(movement[key]).toEqual(properties[key].validValue);
				expect(movement[`_${key}`]).toEqual(properties[key].validValue);
			});
			it(`${key} setter should throw an error when value passed is invalid`, () => {
				try {
					movement[key] = properties[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});
	});

	describe('toObject', () => {
		it('should return an object with the movement properties', () => {
			const movement = {
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				name: 'Movement',
				measurement: 'weight',
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			};

			let newMovement = new Movement(movement);
			expect(movement).toEqual(newMovement.toObject());
		});
	});
});
