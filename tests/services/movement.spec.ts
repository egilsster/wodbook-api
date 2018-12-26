import * as sinon from 'sinon';
import { MovementService } from '../../src/services/movement';
import { MovementScoreDao } from '../../src/dao/movement.score';
import { MovementDao } from '../../src/dao/movement';
import { Movement } from '../../src/models/movement';

describe('MovementService', () => {
	const movement = new Movement({
		id: '5L129VaYljbRepTqO7zI39oRHvgeYWK6',
		name: 'HSPU',
		measurement: 'reps',
		userId: 'KkZogjZCwjq6IzE1QAQmrXaKTTMuUp4D'
	});

	const claims: any = { userId: 'KkZogjZCwjq6IzE1QAQmrXaKTTMuUp4D' };

	let service: MovementService, _service: sinon.SinonMock;
	let movementDao: MovementDao, _movementDao: sinon.SinonMock;
	let movementScoreDao: MovementScoreDao, _movementScoreDao: sinon.SinonMock;

	beforeEach(() => {
		const anyOptions: any = {};
		movementDao = new MovementDao(anyOptions);
		_movementDao = sinon.mock(movementDao);
		movementScoreDao = new MovementScoreDao(anyOptions);
		_movementScoreDao = sinon.mock(movementScoreDao);

		service = new MovementService(anyOptions);
		_service = sinon.mock(service);

		const options = {
			movementDao,
			movementScoreDao
		};

		service = new MovementService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_service.verify();
		_movementDao.verify();
		_movementScoreDao.verify();
	});

	describe('constructor', () => {
		it('should create new instance of service', () => {
			const instance = new MovementService({});
			expect(instance).toBeDefined();
		});
	});

	describe('createMovement', () => {
		it('should create new movement', async () => {
			_movementDao.expects('createMovement').withExactArgs(movement).resolves(movement);

			await expect(service.createMovement(movement.toObject(), claims))
				.resolves.toEqual(movement);
		});
	});

	describe('getMovements', () => {
		it('should return list of movements', async () => {
			_movementDao.expects('getMovements').withExactArgs(claims).resolves([movement]);

			await expect(service.getMovements(claims))
				.resolves.toEqual([movement]);
		});
	});

	describe('getMovementById', () => {
		it('should return movement with specified id', async () => {
			_movementDao.expects('getMovementById').withExactArgs(movement.id, claims).resolves(movement);

			await expect(service.getMovementById(movement.id, claims))
				.resolves.toEqual(movement);
		});
	});

	describe('getScores', () => {
		it('should return scores for specified movement', async () => {
			_service.expects('getMovementById').withExactArgs(movement.id, claims).resolves(movement);
			_movementScoreDao.expects('getMovementScores').withExactArgs(movement.id, claims).resolves([]);

			await expect(service.getScores(movement.id, claims))
				.resolves.toEqual([]);
		});
	});

	describe('addScore', () => {
		const score = {
			movementId: movement.id,
			measurement: 'reps',
			sets: '1',
			reps: 7
		};

		it('should add score linked to movement', async () => {
			_service.expects('getMovementById').withExactArgs(movement.id, claims).resolves(movement);
			_movementScoreDao.expects('createMovementScore').resolves(score);

			await expect(service.addScore(movement.id, score, claims))
				.resolves.toEqual(score);
		});
	});
});
