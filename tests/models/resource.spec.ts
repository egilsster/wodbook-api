import * as HttpStatus from 'http-status-codes';
import { Resource } from '../../src/models/resource';
import { ServiceError } from '../../src/utils/service.error';
import { ERROR_TEMPLATES } from '../../src/utils/error.templates';

describe('ResourceModel', () => {
	describe('constructor', () => {
		it('should initialize new resource', () => {
			const resource = new Resource({
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8'
			});

			expect(resource.id).toEqual('rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8');
		});

		it('should throw exception if id is invalid', () => {
			try {
				const resource = new Resource({
					id: 'invalidId',
					userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx'
				});
				expect(resource).toBeUndefined();
			} catch (err) {
				expect(err).toHaveProperty('status', HttpStatus.UNPROCESSABLE_ENTITY);
				expect(err.title).toMatch(/Invalid property value/);
			}
		});

		it('should throw exception if userId is invalid', () => {
			try {
				const resource = new Resource({
					id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
					userId: 'invalidId'
				});
				expect(resource).toBeUndefined();
			} catch (err) {
				expect(err).toHaveProperty('status', HttpStatus.UNPROCESSABLE_ENTITY);
				expect(err.title).toMatch(/Invalid property value/);
			}
		});

		it('Can grab the id from _id', () => {
			const resource = new Resource({
				_id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx'
			});

			expect(resource.id).toEqual('rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8');
		});
	});

	describe('getters / setters', () => {
		const immutableProps = {
			id: { validValue: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8', invalidValue: 'invalid' },
			userId: { validValue: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx', invalidValue: 'invalid' },
			createdAt: { validValue: new Date(), invalidValue: 'invalid' }
		};

		const properties = {
			updatedAt: { validValue: new Date(), invalidValue: 123 },
		};
		let resource: Resource;

		beforeEach(() => {
			resource = new Resource({
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx',
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			});
		});

		Object.keys(immutableProps).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(resource[key]).toBeDefined();
			});

			it(`${key} setter should throw an error when ${key} is already set`, () => {
				try {
					resource[key] = immutableProps[key].validValue;
				} catch (err) {
					expect(err.title).toMatch(/Immutable property/);
				}
			});

			it(`${key} setter should throw an error when value passed is invalid`, () => {
				// Un-set immutable property
				resource[`_${key}`] = undefined;
				try {
					resource[key] = immutableProps[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});

		Object.keys(properties).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(resource[key]).toBeDefined();
			});
			it(`${key} setter should set value`, () => {
				resource[key] = properties[key].validValue;
				expect(resource[key]).toEqual(properties[key].validValue);
				expect(resource[`_${key}`]).toEqual(properties[key].validValue);
			});
			it(`${key} setter should throw an error when value passed is invalid`, () => {
				try {
					resource[key] = properties[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});
	});

	describe('validateRequiredFields', () => {
		it('should throw an error when required fields are missing', () => {
			const requiredFields = ['name', 'measurement'];
			const err = new ServiceError(ERROR_TEMPLATES.MISSING_FIELDS, { meta: { missingFields: ['name'], requiredFields } });
			expect(() => Resource.validateRequiredFields({ measurement: 'time' }, requiredFields)).toThrow(err);
		});

		it('should not throw an error if all fields are provided', () => {
			expect(() => Resource.validateRequiredFields({ measurement: 'time' }, ['measurement'])).not.toThrow();
		});
	});
});
