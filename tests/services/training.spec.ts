import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';

import { ExpressError } from '../../src/utils/express.error';
import { TrainingService } from '../../src/services/training';
import { QueryUtils } from '../../src/utils/query.utils';

describe('TrainingService', () => {
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
		'parentId': movement.id,
		'score': '100',
		'measurement': 'weight',
		'sets': 1,
		'notes': '',
		'date': new Date('2014-01-03')
	};
	let service: TrainingService, _service: sinon.SinonMock;
	let modelInstance, _modelInstance: sinon.SinonMock;
	let _model: sinon.SinonMock;
	class MockModel {
		constructor() { return modelInstance; }
		save() { return null; }
		static find() { return null; }
		static findOne() { return null; }
		static ensureIndexes() { return null; }
	}

	beforeEach(() => {
		modelInstance = new MockModel();
		_modelInstance = sinon.mock(modelInstance);
		_model = sinon.mock(MockModel);

		service = new TrainingService(MockModel, MockModel);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_model.verify();
		_service.verify();
		_modelInstance.verify();
	});

	describe('getMany', () => {
		it('should return list of items', async () => {
			const items = ['item1', 'item2'];
			_model.expects('find').returns(items);

			const res = await service.getMany(user.id);
			expect(res).toEqual(items);
		});
	});

	describe('getOne', () => {
		it('should get single item if it exists', async () => {
			_model.expects('findOne').withArgs(QueryUtils.forOne({ '_id': movement.id }, user.id)).returns(movement);

			const res = await service.getOne(user.id, movement.id);
			expect(res).toEqual(movement);
		});

		it('should get nothing if item does not exist', async () => {
			_model.expects('findOne').withArgs(QueryUtils.forOne({ '_id': 'notId' }, user.id)).returns(null);

			const res = await service.getOne(user.id, 'notId');
			expect(res).toEqual(null);
		});
	});

	describe('getByFilter', () => {
		it('should return item based on filter', async () => {
			const filter = { 'name': 'Snatch' };
			_model.expects('findOne').withArgs(QueryUtils.forOne(filter, user.id)).returns(movement);

			const res = await service.getByFilter(user.id, filter);
			expect(res).toEqual(movement);
		});
	});

	describe('getScores', () => {
		it('should scores for item if item exists', async () => {
			_service.expects('getOne').withExactArgs(user.id, movement.id).resolves(movement);
			_model.expects('find').withArgs(QueryUtils.forOne({ 'parentId': movement.id }, user.id)).returns([]);

			const res = await service.getScores(user.id, movement.id);
			expect(res).toEqual([]);
		});

		it('should throw error if item does not exist', async () => {
			const err = new ExpressError(`Entity with identity '${movement.id}' does not exist`, HttpStatus.NOT_FOUND);
			_service.expects('getOne').withExactArgs(user.id, movement.id).resolves(null);

			const promise = service.getScores(user.id, movement.id);
			await expect(promise).rejects.toEqual(err);
		});
	});

	describe('create', () => {
		it('should successfully create an item', async () => {
			_modelInstance.expects('save').returns(movement);

			const promise = service.create(movement);
			await expect(promise).resolves.toEqual(movement);
		});

		it('should throw 409 Conflict if item exists for this user', async () => {
			_modelInstance.expects('save').throws();

			const promise = service.create(movement);
			await expect(promise).rejects.toBeDefined();
		});
	});

	describe('addScore', () => {
		it('should successfully add a score if item exists', async () => {
			_service.expects('getOne').resolves(modelInstance);
			_modelInstance.expects('save').resolves('data');

			const promise = service.addScore(user.id, movement.id, score);
			await expect(promise).resolves.toEqual('data');
		});

		it('should throw 404 Not found if item does not exist', async () => {
			_service.expects('getOne').resolves();

			const promise = service.addScore(user.id, movement.id, score);
			await expect(promise).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
		});
	});
});
