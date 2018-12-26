import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { User } from '../../src/models/user';

describe('UserModel', () => {
	describe('constructor', () => {
		it('should initialize new user', () => {
			const user = new User({
				email: 'some@email.com',
				password: 'pass',
				admin: false
			});

			expect(user.email).toEqual('some@email.com');
			expect(user.password).toEqual('pass');
		});

		it('should throw exception if fields are missing', () => {
			try {
				const user = new User({
					id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				});
				expect(user).toBeUndefined();
			} catch (err) {
				expect(err).toHaveProperty('status', HttpStatus.BAD_REQUEST);
			}
		});

		it('Can grab the id from _id', () => {
			const user = new User({
				_id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				email: 'some@email.com',
				password: 'pass',
				admin: false
			});

			expect(user.id).toEqual('rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8');
			expect(user.email).toEqual('some@email.com');
		});
	});

	describe('getters / setters', () => {
		const immutableProps = {
			id: { validValue: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8', invalidValue: 'invalid' },
			createdAt: { validValue: new Date(), invalidValue: 'invalid' }
		};

		const properties = {
			email: { validValue: 'password', invalidValue: 123 },
			password: { validValue: 'password', invalidValue: 123 },
			admin: { validValue: true, invalidValue: 123 },
			firstName: { validValue: 'valid name', invalidValue: 123 },
			lastName: { validValue: 'valid name', invalidValue: 123 },
			dateOfBirth: { validValue: new Date(), invalidValue: 123 },
			boxName: { validValue: 'valid name', invalidValue: 123 },
			height: { validValue: 200, invalidValue: '123' },
			weight: { validValue: 100000, invalidValue: '123' },
			avatarUrl: { validValue: 'avatarUrl', invalidValue: 123 },
			updatedAt: { validValue: new Date(), invalidValue: 123 },
		};
		let user: User;

		beforeEach(() => {
			user = new User({
				id: 'rnIGaB1Xx8unD4BMP5v9jgB_rW670Nj8',
				email: 'test@email.com',
				password: 'test',
				admin: false,
				firstName: 'Cloud',
				lastName: 'Atlas',
				dateOfBirth: new Date('1969-06-09T00:00:00'),
				boxName: 'CrossFit Cloud',
				height: 199,
				weight: 90000,
				avatarUrl: 'avatarUrl',
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			});
		});

		Object.keys(immutableProps).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(user[key]).toBeDefined();
			});

			it(`${key} setter should throw an error when ${key} is already set`, () => {
				try {
					user[key] = immutableProps[key].validValue;
				} catch (err) {
					expect(err.title).toMatch(/Immutable property/);
				}
			});

			it(`${key} setter should throw an error when value passed is invalid`, () => {
				// Un-set immutable property
				user[`_${key}`] = undefined;
				try {
					user[key] = immutableProps[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});

		Object.keys(properties).forEach(key => {
			it(`${key} getter should get value`, () => {
				expect(user[key]).toBeDefined();
			});
			it(`${key} setter should set value`, () => {
				user[key] = properties[key].validValue;
				expect(user[key]).toEqual(properties[key].validValue);
				expect(user[`_${key}`]).toEqual(properties[key].validValue);
			});
			it(`${key} setter should throw an error when value passed is invalid`, () => {
				try {
					user[key] = properties[key].invalidValue;
				} catch (err) {
					expect(err.title).toMatch(/Invalid property value/);
				}
			});
		});
	});

	describe('toObject', () => {
		it('should return an object with the user properties', () => {
			const user = {
				id: 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7',
				email: 'test@email.com',
				password: 'test',
				admin: false,
				firstName: 'Cloud',
				lastName: 'Atlas',
				dateOfBirth: new Date('1969-06-09T00:00:00'),
				boxName: 'CrossFit Cloud',
				height: 199,
				weight: 90000,
				avatarUrl: 'avatarUrl',
				createdAt: new Date('2018-10-10T00:00:00'),
				updatedAt: new Date('2018-10-10T00:00:00')
			};

			let newUser = new User(user);
			expect(_.omit(user, ['password'])).toEqual(newUser.toObject());
		});
	});
});
