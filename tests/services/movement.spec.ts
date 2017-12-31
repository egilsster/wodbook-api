import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import * as sqlite from 'sqlite';

import ExpressError from '../../src/utils/express.error';
import { MovementService } from '../../src/services/movement';
import { MovementScoreType } from '../../src/models/movement.score';
import { MovementType } from '../../src/models/movement';

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
		this.populate = () => { };
		this.save = () => movement;
		return modelInstance;
	};
	MockModel.populate = () => { };
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
			_model.expects('find').returns(MockModel);
			_model.expects('populate').resolves(items);

			const res = await service.getMovements(user);
			expect(res).toEqual(items);
			verifyAll();
		});
	});

	describe('getMovement', () => {
		it('should get single movement if it exists', async () => {
			_model.expects('findOne').withArgs({ '_id': movement.id, 'createdBy': user.id }).returns(MockModel);
			_model.expects('populate').withArgs('scores').resolves(movement);

			const res = await service.getMovement(user, movement.id);
			expect(res).toEqual(movement);
			verifyAll();
		});

		it('should get nothing if movement does not exist', async () => {
			_model.expects('findOne').withArgs({ '_id': 'notId', 'createdBy': user.id }).returns(MockModel);
			_model.expects('populate').resolves(null);

			const res = await service.getMovement(user, 'notId');
			expect(res).toEqual(null);
			verifyAll();
		});
	});

	describe('createMovement', () => {
		it('should successfully create a movement', async () => {
			_service.expects('getMovement').resolves(null);
			_modelInstance.expects('save').returns(movement);

			const promise = service.createMovement(movement, user);
			await expect(promise).resolves.toEqual(movement);
			verifyAll();
		});

		it('should throw 409 Conflict if movement exists for this user', async () => {
			_service.expects('getMovement').resolves(movement);

			const promise = service.createMovement(movement, user);
			await expect(promise).rejects.toHaveProperty('status', HttpStatus.CONFLICT);
			verifyAll();
		});
	});

	describe('addScore', () => {
		it('should successfully add a score if movement exists', async () => {
			_service.expects('getMovement').resolves(modelInstance);
			_modelInstance.expects('save').resolves();
			_modelInstance.expects('save').resolves();
			_modelInstance.expects('populate').resolves('data');

			const promise = service.addScore(user, movement.id, score);
			await expect(promise).resolves.toEqual('data');
			verifyAll();
		});

		it('should throw 404 Not found if movement does not exist', async () => {
			_service.expects('getMovement').resolves();

			const promise = service.addScore(user, movement.id, score);
			await expect(promise).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
			verifyAll();
		});
	});
});
