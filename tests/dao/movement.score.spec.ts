import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { MovementScoreDao } from '../../src/dao/movement.score';
import { MovementScore } from '../../src/models/movement.score';
import { Movement } from '../../src/models/movement';
import { ServiceError } from '../../src/utils/service.error';
import { ErrorUtils } from '../../src/utils/error.utils';
import { ERROR_TEMPLATES } from '../../src/utils/error.templates';

describe('MovementScoreDao', () => {
	let movementScoreDao: MovementScoreDao, _movementScoreDao: sinon.SinonMock;
	let mongo;
	let _movementScoreCollection: sinon.SinonMock;
	let _errorUtils: sinon.SinonMock;

	const dateProps = ['createdAt', 'updatedAt'];
	const userId = 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx';
	const claims: any = { userId: userId };
	const movement = new Movement({
		id: '5L129VaYljbRepTqO7zI39oRHvgeYWK6',
		name: 'Snatch',
		measurement: 'weight',
		userId: 'KkZogjZCwjq6IzE1QAQmrXaKTTMuUp4D'
	});
	const movementScore = new MovementScore({
		movementId: movement.id,
		measurement: movement.measurement,
		score: 100,
		sets: 1,
		userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx'
	});

	beforeEach(() => {
		mongo = {
			movementScores: { insertOne() { }, findOne() { }, find() { }, updateOne() { } }
		};

		_movementScoreCollection = sinon.mock(mongo.movementScores);

		movementScoreDao = new MovementScoreDao(mongo);
		_movementScoreDao = sinon.mock(movementScoreDao);

		_errorUtils = sinon.mock(ErrorUtils);
	});

	afterEach(() => {
		_movementScoreCollection.verify();
		_movementScoreDao.verify();
		_errorUtils.verify();
	});

	describe('createMovementScore', () => {
		it('should call insertOne to create a new movementScore', async () => {
			_movementScoreCollection.expects('insertOne').resolves({
				ops: [movementScore.toObject()]
			});
			const createdMovementScore = await movementScoreDao.createMovementScore(movementScore);

			expect(_.omit(createdMovementScore, dateProps)).toEqual(_.omit(movementScore, dateProps));
		});

		it('should throw error when insertOne fails', async () => {
			const serviceErr = new ServiceError(ERROR_TEMPLATES.CONFLICT);
			const err = new Error();
			_movementScoreCollection.expects('insertOne').rejects(err);
			_errorUtils.expects('convertMongoErrorToServiceError').withArgs(err).returns(serviceErr);

			await expect(movementScoreDao.createMovementScore(movementScore)).rejects.toEqual(expect.any(ServiceError));
		});
	});

	describe('getMovementScores', () => {
		it('should call find to get the movementScores', async () => {
			const cursorRes = {
				toArray: sinon.stub().resolves([movementScore.toObject()])
			};
			_movementScoreCollection.expects('find').returns(cursorRes);

			await expect(movementScoreDao.getMovementScores(movement.id, claims)).resolves.toEqual([movementScore]);
		});

		it('should return empty array if no movementScores exist', async () => {
			const cursorRes = {
				toArray: sinon.stub().resolves([])
			};
			_movementScoreCollection.expects('find').returns(cursorRes);

			await expect(movementScoreDao.getMovementScores(movement.id, claims)).resolves.toEqual([]);
		});
	});

	describe('getMovementScoreById', () => {
		it('should call findOne to get the movementScore', async () => {
			_movementScoreCollection.expects('findOne').resolves(movementScore.toObject());

			await expect(movementScoreDao.getMovementScoreById(movementScore.id, claims)).resolves.toEqual(movementScore);
		});

		it('should throw exception with status 404 if movementScore is not found', async () => {
			_movementScoreCollection.expects('findOne').resolves();

			await expect(movementScoreDao.getMovementScoreById(movementScore.id, claims)).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
		});
	});

	describe('updateMovementScoreById', () => {
		it('should update movementScore', async () => {
			_movementScoreCollection.expects('updateOne').resolves(movementScore);

			await expect(movementScoreDao.updateMovementScoreById(movementScore.id, movementScore, claims)).resolves.toEqual(movementScore);
		});

		it('should throw error when updateOne errors', async () => {
			const serviceErr = new ServiceError(ERROR_TEMPLATES.CONFLICT);
			const err = new Error();
			_movementScoreCollection.expects('updateOne').rejects(err);
			_errorUtils.expects('convertMongoErrorToServiceError').withArgs(err).returns(serviceErr);

			await expect(movementScoreDao.updateMovementScoreById(movementScore.id, movementScore, claims)).rejects.toEqual(expect.any(ServiceError));
		});
	});
});
