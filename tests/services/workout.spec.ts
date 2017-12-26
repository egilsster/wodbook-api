import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';

import ExpressError from '../../src/utils/express.error';
import WorkoutService from '../../src/services/workout';

describe('WorkoutService', () => {
	const user = {
		'id': 'userId',
		'email': 'user@email.com'
	};
	const data = {
		'name': 'Amanda',
		'id': 'someid'
	};
	let service: WorkoutService;
	let _service: sinon.SinonMock;
	let modelInstance;
	let _modelInstance: sinon.SinonMock;
	let _model: sinon.SinonMock;
	let MockModel: any = function () {
		this.title = 'Amanda';
		this.scores = [];
		this.scoreType = 'time';
		this.description = 'desc';
		this.save = () => data;
		return modelInstance;
	};
	MockModel.find = () => { };
	MockModel.findOne = () => { };

	beforeEach(() => {
		modelInstance = new MockModel();
		_modelInstance = sinon.mock(modelInstance);
		_model = sinon.mock(MockModel);

		const options = {
			'workoutModel': MockModel
		};

		service = new WorkoutService(options);
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
		const service = new WorkoutService();
		expect(service).toBeDefined();
	});

	describe('getWorkouts', () => {
		it('should return list of workouts', async () => {
			const items = ['item1', 'item2'];
			_model.expects('find').resolves(items);

			const res = await service.getWorkouts(user);
			expect(res).toEqual(items);
			verifyAll();
		});
	});

	describe('getWorkout', () => {
		it('should get single workout if workout exists', async () => {
			_model.expects('findOne').withArgs({ '_id': data.id, 'createdBy': user.id }).resolves(data);

			const res = await service.getWorkout(user, data.id);
			expect(res).toEqual(data);
			verifyAll();
		});

		it('should get nothing if workout does not exist', async () => {
			_model.expects('findOne').resolves(null);

			const res = await service.getWorkout(user, 'notId');
			expect(res).toEqual(null);
			verifyAll();
		});
	});

	describe('createWorkout', () => {
		it('should return saved model when saved', async () => {
			_model.expects('findOne').resolves(null);
			_modelInstance.expects('save').resolves(data);

			const promise = service.createWorkout(user, data);
			await expect(promise).resolves.toEqual(data);
			verifyAll();
		});

		it('should throw exception if resource already exists', async () => {
			_model.expects('findOne').resolves('workout');

			const promise = service.createWorkout(user, data);
			const conflict = new ExpressError('Conflict', `Workout: ${data.name}, already exists`, HttpStatus.CONFLICT);
			await expect(promise).rejects.toEqual(conflict);
			verifyAll();
		});
	});

	describe('addScore', () => {
		it('should add score to a workout if it exists', async () => {
			_model.expects('findOne').withArgs({ '_id': data.id, 'createdBy': user.id }).resolves(modelInstance);
			_modelInstance.expects('save').resolves(modelInstance);

			const promise = service.addScore(user, data.id, 'new score');
			await expect(promise).resolves.toEqual(modelInstance);
			verifyAll();
		});

		it('should throw exception if workout does not exist', async () => {
			_model.expects('findOne').resolves();

			const err = new ExpressError('Object not found', `Entity with identity 'Amanda' does not exist`, HttpStatus.NOT_FOUND);
			const promise = service.addScore(user, data.name, 'new score');
			await expect(promise).rejects.toEqual(err);
			verifyAll();
		});
	});
});
