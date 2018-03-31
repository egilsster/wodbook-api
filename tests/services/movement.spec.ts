import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import * as sqlite from 'sqlite';

import { ExpressError } from '../../src/utils/express.error';
import { MovementService } from '../../src/services/movement';
import { MovementScoreType } from '../../src/models/movement.score';
import { MovementType } from '../../src/models/movement';
import { QueryUtils } from '../../src/utils/query.utils';

describe('MovementService', () => {
	const user = {
		'id': 'userId',
		'email': 'user@email.com'
	};
	const movement: any = {
		'id': '5a4704ca46425f97c638bcaa',
		'name': 'Snatch',
		'scores': [],
		'measurement': 'weight',
		'createdBy': user.id,
		'createdAt': new Date(),
		'modifiedAt': new Date()
	};
	const score: any = {
		'movementId': movement.id,
		'score': '100',
		'measurement': 'weight',
		'sets': 1,
		'notes': '',
		'date': new Date('2014-01-03')
	};
	let service: MovementService, _service: sinon.SinonMock;
	let modelInstance, _modelInstance: sinon.SinonMock;
	let _model: sinon.SinonMock;
	let MockModel: any = function () {
		this.id = '5a4704ca46425f97c638bcaa';
		this.name = 'Snatch';
		this.scores = [];
		this.save = () => movement;
		return modelInstance;
	};
	MockModel.find = () => { };
	MockModel.findOne = () => { };

	beforeEach(() => {
		modelInstance = new MockModel();
		_modelInstance = sinon.mock(modelInstance);
		_model = sinon.mock(MockModel);

		const options = {
			'movementModel': MockModel,
			'movementScoreModel': MockModel,
			'logger': {
				info() { },
				warn() { },
				error() { }
			}
		};

		service = new MovementService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_model.restore();
		_service.restore();
		_modelInstance.restore();
	});

	function verifyAll() {
		_model.verify();
		_service.verify();
		_modelInstance.verify();
	}

	it('should create an instance without any options', () => {
		const service = new MovementService();
		expect(service).toBeDefined();
	});

	describe('getMovements', () => {
		it('should return list of movements', async () => {
			const items = ['item1', 'item2'];
			_model.expects('find').returns(items);

			const res = await service.getMovements(user.id);
			expect(res).toEqual(items);
			verifyAll();
		});
	});

	describe('getMovement', () => {
		it('should get single movement if it exists', async () => {
			_model.expects('findOne').withArgs(QueryUtils.forOne({ '_id': movement.id }, user.id)).returns(movement);

			const res = await service.getMovement(user.id, movement.id);
			expect(res).toEqual(movement);
			verifyAll();
		});

		it('should get nothing if movement does not exist', async () => {
			_model.expects('findOne').withArgs(QueryUtils.forOne({ '_id': 'notId' }, user.id)).returns(null);

			const res = await service.getMovement(user.id, 'notId');
			expect(res).toEqual(null);
			verifyAll();
		});
	});

	describe('getMovementScores', () => {
		it('should scores for movement if movement exists', async () => {
			_service.expects('getMovement').withExactArgs(user.id, movement.id).resolves(movement);
			_model.expects('find').withArgs(QueryUtils.forOne({ 'movementId': movement.id }, user.id)).returns([]);

			const res = await service.getMovementScores(user.id, movement.id);
			expect(res).toEqual([]);
			verifyAll();
		});

		it('should throw error if movement does not exist', async () => {
			const err = new ExpressError(`Entity with identity '${movement.id}' does not exist`, HttpStatus.NOT_FOUND);
			_service.expects('getMovement').withExactArgs(user.id, movement.id).resolves(null);

			const promise = service.getMovementScores(user.id, movement.id);
			await expect(promise).rejects.toEqual(err);
			verifyAll();
		});
	});

	describe('createMovement', () => {
		it('should successfully create a movement', async () => {
			_modelInstance.expects('save').returns(movement);

			const promise = service.createMovement(movement);
			await expect(promise).resolves.toEqual(movement);
			verifyAll();
		});

		it('should throw 409 Conflict if movement exists for this user', async () => {
			_modelInstance.expects('save').throws();

			const promise = service.createMovement(movement);
			await expect(promise).rejects.toBeDefined();
			verifyAll();
		});
	});

	describe('addScore', () => {
		it('should successfully add a score if movement exists', async () => {
			_service.expects('getMovement').resolves(modelInstance);
			_modelInstance.expects('save').resolves('data');

			const promise = service.addScore(user.id, movement.id, score);
			await expect(promise).resolves.toEqual('data');
			verifyAll();
		});

		it('should throw 404 Not found if movement does not exist', async () => {
			_service.expects('getMovement').resolves();

			const promise = service.addScore(user.id, movement.id, score);
			await expect(promise).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
			verifyAll();
		});
	});
});
