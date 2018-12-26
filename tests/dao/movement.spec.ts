import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import { MovementDao } from '../../src/dao/movement';
import { Movement } from '../../src/models/movement';
import { ServiceError } from '../../src/utils/service.error';
import { ErrorUtils } from '../../src/utils/error.utils';
import { ERROR_TEMPLATES } from '../../src/utils/error.templates';

describe('MovementDao', () => {
	let movementDao: MovementDao, _movementDao: sinon.SinonMock;
	let mongo;
	let _movementCollection: sinon.SinonMock;
	let _errorUtils: sinon.SinonMock;
	let movement: Movement;

	const userId = 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx';
	const claims: any = { userId: userId };

	beforeEach(() => {
		mongo = {
			movements: { insertOne() { }, findOne() { }, find() { }, updateOne() { } }
		};

		_movementCollection = sinon.mock(mongo.movements);

		movementDao = new MovementDao(mongo);
		_movementDao = sinon.mock(movementDao);

		_errorUtils = sinon.mock(ErrorUtils);

		movement = new Movement({
			id: '5L129VaYljbRepTqO7zI39oRHvgeYWK6',
			name: 'HSPU',
			measurement: 'reps',
			userId: 'KkZogjZCwjq6IzE1QAQmrXaKTTMuUp4D'
		});
	});

	afterEach(() => {
		_movementCollection.verify();
		_movementDao.verify();
		_errorUtils.verify();
	});

	describe('createMovement', () => {
		it('should call insertOne to create a new movement', async () => {
			_movementCollection.expects('insertOne').resolves({
				ops: [movement.toObject()]
			});
			const createdMovement = await movementDao.createMovement(movement);

			expect(createdMovement.id).toEqual(movement.id);
			expect(createdMovement.name).toEqual(movement.name);
			expect(createdMovement.measurement).toEqual(movement.measurement);
			expect(createdMovement.userId).toEqual(movement.userId);
			expect(new Date(createdMovement.createdAt)).not.toBeNaN();
			expect(new Date(createdMovement.updatedAt)).not.toBeNaN();
		});

		it('should throw error when insertOne fails', async () => {
			const serviceErr = new ServiceError(ERROR_TEMPLATES.CONFLICT);
			const err = new Error();
			_movementCollection.expects('insertOne').rejects(err);
			_errorUtils.expects('convertMongoErrorToServiceError').withArgs(err).returns(serviceErr);

			await expect(movementDao.createMovement(movement)).rejects.toEqual(expect.any(ServiceError));
		});
	});

	describe('getMovements', () => {
		it('should call find to get the movements', async () => {
			const cursorRes = {
				toArray: sinon.stub().resolves([movement.toObject()])
			};
			_movementCollection.expects('find').returns(cursorRes);

			await expect(movementDao.getMovements(claims)).resolves.toEqual([movement]);
		});

		it('should return empty array if no movements exist', async () => {
			const cursorRes = {
				toArray: sinon.stub().resolves([])
			};
			_movementCollection.expects('find').returns(cursorRes);

			await expect(movementDao.getMovements(claims)).resolves.toEqual([]);
		});
	});

	describe('getMovementById', () => {
		it('should call findOne to get the movement', async () => {
			_movementCollection.expects('findOne').resolves(movement.toObject());

			await expect(movementDao.getMovementById(movement.id, claims)).resolves.toEqual(movement);
		});

		it('should throw exception with status 404 if movement is not found', async () => {
			_movementCollection.expects('findOne').resolves();

			await expect(movementDao.getMovementById(movement.id, claims)).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
		});
	});

	describe('updateMovementById', () => {
		it('should update movement', async () => {
			_movementCollection.expects('updateOne').resolves(movement);

			await expect(movementDao.updateMovementById(movement.id, movement, claims)).resolves.toEqual(movement);
		});

		it('should throw error when updateOne errors', async () => {
			const serviceErr = new ServiceError(ERROR_TEMPLATES.CONFLICT);
			const err = new Error();
			_movementCollection.expects('updateOne').rejects(err);
			_errorUtils.expects('convertMongoErrorToServiceError').withArgs(err).returns(serviceErr);

			await expect(movementDao.updateMovementById(movement.id, movement, claims)).rejects.toEqual(expect.any(ServiceError));
		});
	});
});
